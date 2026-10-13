/*
 * Consultas do painel /admin (sempre com a chave secreta; as páginas chamam requireAdmin() antes).
 */
import { CATALOG, type CatalogProduct } from '@/data/catalog'
import { stockOf, type LiveCatalog } from '@/data/live'
import type { Order, OrderStatus } from './orders'
import { db } from './supabase'

/** Pedidos que viraram venda (já pagos, em qualquer etapa de envio). */
export const SOLD: OrderStatus[] = ['paid', 'review', 'shipped', 'delivered']

/** Abaixo disto (e acima de zero) o estoque é “baixo”. */
export const LOW_STOCK = 2

export type OrderEvent = { status: OrderStatus; created_at: string }

export type RestockItem = { product: CatalogProduct; color: string; size: string; quantity: number }

/** Tamanhos esgotados ou com estoque baixo (só os que têm controle de estoque). */
export function restockList(live: LiveCatalog | null): RestockItem[] {
  return CATALOG.flatMap((product) =>
    product.variants.flatMap(({ color }) =>
      product.sizes.flatMap((size) => {
        const quantity = stockOf(live, product.id, color.name, size)
        return quantity !== null && quantity <= LOW_STOCK ? [{ product, color: color.name, size, quantity }] : []
      }),
    ),
  )
}

/** Quantos pedidos pedem ação: pagos para enviar e pagamentos para conferir. */
export async function pendingCounts() {
  const { data, error } = await db().from('orders').select('status').in('status', ['paid', 'review'])
  if (error) throw error
  return {
    toShip: data.filter((o) => o.status === 'paid').length,
    toReview: data.filter((o) => o.status === 'review').length,
  }
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Pedidos mais recentes, filtrados por status e por busca (cliente, produto ou número do pedido). */
export async function listOrders({ statuses, q, limit = 200 }: { statuses?: OrderStatus[]; q?: string; limit?: number }) {
  let query = db().from('orders').select('*').order('created_at', { ascending: false }).limit(q ? 1000 : limit)
  if (statuses) query = query.in('status', statuses)
  const { data, error } = await query.returns<Order[]>()
  if (error) throw error
  if (!q?.trim()) return data

  const terms = normalize(q).split(/\s+/).filter(Boolean)
  return data
    .filter((order) => {
      const text = normalize(
        [
          order.id,
          order.customer?.name,
          order.customer?.email,
          order.customer?.phone_number,
          ...order.items.map((item) => `${item.description} ${item.ref}`),
        ].join(' '),
      )
      return terms.every((term) => text.includes(term))
    })
    .slice(0, limit)
}

export async function getOrderWithEvents(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const [order, events] = await Promise.all([
    db().from('orders').select('*').eq('id', id).maybeSingle<Order>(),
    db().from('order_events').select('status, created_at').eq('order_id', id).order('created_at').returns<OrderEvent[]>(),
  ])
  if (order.error) throw order.error
  if (events.error) throw events.error
  return order.data ? { order: order.data, events: events.data } : null
}

/** Início do dia em São Paulo, `daysAgo` dias atrás, como ISO. */
function startOfDay(daysAgo = 0): Date {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  const start = new Date(`${today}T00:00:00-03:00`)
  start.setUTCDate(start.getUTCDate() - daysAgo)
  return start
}

export type SalesSummary = { total: number; count: number }

/** Vendas de hoje, dos últimos 7 dias e dos últimos 30 dias (em centavos), pela data do pagamento. */
export async function salesSummary() {
  const since = startOfDay(29)
  const { data, error } = await db()
    .from('orders')
    .select('total_cents, paid_at')
    .in('status', SOLD)
    .gte('paid_at', since.toISOString())
  if (error) throw error

  const sum = (from: Date): SalesSummary => {
    const rows = data.filter((o) => o.paid_at && new Date(o.paid_at) >= from)
    return { total: rows.reduce((n, o) => n + o.total_cents, 0), count: rows.length }
  }
  return { today: sum(startOfDay(0)), week: sum(startOfDay(6)), month: sum(since) }
}
