/*
 * Pedidos: monta o pedido a partir da sacola (com os preços e o estoque do painel, nunca os do navegador),
 * guarda no Supabase, confirma o pagamento com a InfinitePay e dá baixa no estoque.
 */
import 'server-only'
import { CATALOG } from '@/data/catalog'
import { applyLive, stockOf, type LiveCatalog } from '@/data/live'
import { checkPayment, type CheckoutItem } from './infinitepay'
import type { Parcel } from './shipping/package'
import { db } from './supabase'

/** 'card' usa o preço do cartão (`price`), 'pix' o preço do Pix (`pix`). */
export type PayMethod = 'card' | 'pix'

/** 'review': pago, mas com valor ou forma de pagamento diferente do pedido — conferir à mão. */
export type OrderStatus = 'pending' | 'paid' | 'review' | 'shipped' | 'delivered' | 'canceled'

/** Linha da sacola como o site envia (mesmo formato salvo no navegador). */
export type CartLine = { id: string; color: string; size: string; qty: number }

export type OrderItem = CheckoutItem & { id: string; ref: string; color: string; size: string }

export type Order = {
  id: string
  status: OrderStatus
  method: PayMethod
  items: OrderItem[]
  total_cents: number
  customer: Record<string, string> | null
  checkout_url: string | null
  invoice_slug: string | null
  transaction_nsu: string | null
  capture_method: string | null
  paid_amount_cents: number | null
  installments: number | null
  receipt_url: string | null
  created_at: string
  paid_at: string | null
  stock_applied: boolean
  items_total_cents: number
  shipping_cents: number
  shipping: OrderShipping | null
  shipping_address: ShippingAddress | null
  customer_cpf: string | null
  nfe_key: string | null
  me_order_id: string | null
  label_cost_cents: number | null
  tracking_code: string | null
  /** Etiqueta no Melhor Envio: comprando, pronta ou com erro (null = ainda não gerada). */
  shipping_status: 'buying' | 'ready' | 'failed' | null
  shipping_error: string | null
}

/** Opção de frete escolhida no checkout, congelada no pedido. */
export type OrderShipping = {
  serviceId: number
  name: string
  carrier: string
  /** O que o cliente pagou de frete (0 = frete grátis). */
  priceCents: number
  /** Custo da etiqueta na cotação. */
  costCents: number
  days: { min: number; max: number }
  source: 'live' | 'fallback'
  parcel: Parcel
}

export type ShippingAddress = {
  cep: string
  street: string
  number: string
  complement?: string
  district: string
  city: string
  uf: string
}

const MAX_LINES = 30
const MAX_QTY = 20

/** Valida a sacola contra o catálogo e o estoque e devolve os itens com preço em centavos, ou o motivo do erro. */
export function priceCart(
  lines: unknown,
  method: PayMethod,
  live: LiveCatalog | null,
): { items: OrderItem[] } | { error: string } {
  if (!Array.isArray(lines) || lines.length === 0) return { error: 'Sacola vazia' }
  if (lines.length > MAX_LINES) return { error: 'Itens demais na sacola' }

  const items: OrderItem[] = []
  for (const line of lines as Partial<CartLine>[]) {
    const base = CATALOG.find((p) => p.id === line.id)
    const product = base && applyLive(base, live)
    if (!product) return { error: `Produto não encontrado: ${String(line.id)}` }
    const variant = product.variants.find((v) => v.color.name === line.color)
    if (!variant) return { error: `${product.name} não tem a cor ${String(line.color)}` }
    const size = product.sizes.find((s) => s === line.size)
    if (!size) return { error: `${product.name} não tem o tamanho ${String(line.size)}` }
    if (variant.soldOut?.includes(size)) return { error: `${product.name} ${variant.color.name} ${size} está esgotado` }
    if (!Number.isInteger(line.qty) || line.qty! < 1 || line.qty! > MAX_QTY) {
      return { error: `Quantidade inválida para ${product.name}` }
    }
    const left = stockOf(live, product.id, variant.color.name, size)
    if (left !== null && line.qty! > left) {
      return { error: `Só ${left === 1 ? 'resta 1 unidade' : `restam ${left} unidades`} de ${product.name} ${variant.color.name} ${size}` }
    }

    items.push({
      id: product.id,
      ref: product.ref,
      color: line.color!,
      size,
      quantity: line.qty!,
      price: Math.round((method === 'pix' ? product.pix : product.price) * 100),
      description: `${product.name} · ${line.color} · ${size}`,
    })
  }
  return { items }
}

export async function findOrder(id: string): Promise<Order | null> {
  // order_nsu vem de fora (webhook, URL de retorno): só consulta se tiver cara de uuid
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data, error } = await db().from('orders').select('*').eq('id', id).maybeSingle<Order>()
  if (error) throw error
  return data
}

/**
 * Confirma na InfinitePay se o pedido foi pago e atualiza o status.
 * Pode ser chamada mais de uma vez (webhook repetido + retorno do cliente): só altera pedido pendente.
 */
export async function confirmPayment(
  order: Order,
  ref: { transaction_nsu: string; slug: string; receipt_url?: string },
): Promise<Order> {
  if (order.status !== 'pending') return order

  const check = await checkPayment({ order_nsu: order.id, transaction_nsu: ref.transaction_nsu, slug: ref.slug })
  if (!check.success || !check.paid) return order

  const expectedMethod = order.method === 'pix' ? 'pix' : 'credit_card'
  const matches = check.amount === order.total_cents && check.capture_method === expectedMethod

  const { data, error } = await db()
    .from('orders')
    .update({
      status: matches ? 'paid' : 'review',
      invoice_slug: ref.slug,
      transaction_nsu: ref.transaction_nsu,
      capture_method: check.capture_method,
      paid_amount_cents: check.paid_amount,
      installments: check.installments,
      receipt_url: ref.receipt_url ?? order.receipt_url,
      paid_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle<Order>()
  if (error) throw error
  // null: outra chamada confirmou primeiro
  if (!data) return (await findOrder(order.id)) ?? order

  // baixa no estoque (a função do banco só aplica uma vez por pedido)
  const stock = await db().rpc('apply_order_stock', { order_id: data.id })
  if (stock.error) console.error(`[orders] erro na baixa de estoque do pedido ${data.id}`, stock.error)
  return data
}

export const json = (body: unknown, status = 200) => Response.json(body, { status })
