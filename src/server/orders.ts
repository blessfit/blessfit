/*
 * Pedidos: monta o pedido a partir da sacola (com os preços do catálogo, nunca os do navegador),
 * guarda no Supabase e confirma o pagamento com a InfinitePay.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { CATALOG } from '@/data/catalog'
import { checkPayment, type CheckoutItem } from './infinitepay'

/** 'card' usa o preço do cartão (`price`), 'pix' o preço do Pix (`pix`). */
export type PayMethod = 'card' | 'pix'

/** 'review': pago, mas com valor ou forma de pagamento diferente do pedido — conferir à mão. */
export type OrderStatus = 'pending' | 'paid' | 'review' | 'canceled'

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
}

let client: SupabaseClient | undefined

export function db(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY não configurados')
  client ??= createClient(url, key, { auth: { persistSession: false } })
  return client
}

const MAX_LINES = 30
const MAX_QTY = 20

/** Valida a sacola contra o catálogo e devolve os itens com preço em centavos, ou o motivo do erro. */
export function priceCart(lines: unknown, method: PayMethod): { items: OrderItem[] } | { error: string } {
  if (!Array.isArray(lines) || lines.length === 0) return { error: 'Sacola vazia' }
  if (lines.length > MAX_LINES) return { error: 'Itens demais na sacola' }

  const items: OrderItem[] = []
  for (const line of lines as Partial<CartLine>[]) {
    const product = CATALOG.find((p) => p.id === line.id)
    if (!product) return { error: `Produto não encontrado: ${String(line.id)}` }
    if (!product.variants.some((v) => v.color.name === line.color)) {
      return { error: `${product.name} não tem a cor ${String(line.color)}` }
    }
    const size = product.sizes.find((s) => s === line.size)
    if (!size) return { error: `${product.name} não tem o tamanho ${String(line.size)}` }
    if (product.soldOut?.includes(size)) return { error: `${product.name} ${size} está esgotado` }
    if (!Number.isInteger(line.qty) || line.qty! < 1 || line.qty! > MAX_QTY) {
      return { error: `Quantidade inválida para ${product.name}` }
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
  return data ?? (await findOrder(order.id)) ?? order
}

export const json = (body: unknown, status = 200) => Response.json(body, { status })
