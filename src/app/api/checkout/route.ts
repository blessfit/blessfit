/*
 * POST /api/checkout — cria o pedido e devolve o link de pagamento da InfinitePay.
 *
 * Corpo: { method: 'card' | 'pix', lines: [{ id, color, size, qty }], customer?: { name, email, phone } }
 * Resposta: { orderId, url } — o site manda o cliente para `url`.
 */
import { createCheckoutLink, type CheckoutCustomer } from '@/server/infinitepay'
import { db, json, priceCart, type Order, type PayMethod } from '@/server/orders'

type Body = {
  method?: unknown
  lines?: unknown
  customer?: { name?: unknown; email?: unknown; phone?: unknown }
}

const text = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined

export async function POST(request: Request): Promise<Response> {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  if (body.method !== 'card' && body.method !== 'pix') return json({ error: 'Forma de pagamento inválida' }, 400)
  const method: PayMethod = body.method

  const priced = priceCart(body.lines, method)
  if ('error' in priced) return json({ error: priced.error }, 400)
  const { items } = priced

  const phone = text(body.customer?.phone, 20)?.replace(/\D/g, '')
  const customer: CheckoutCustomer = {
    name: text(body.customer?.name, 120),
    email: text(body.customer?.email, 160),
    phone_number: phone ? `+${phone.startsWith('55') ? phone : `55${phone}`}` : undefined,
  }
  const hasCustomer = Object.values(customer).some(Boolean)

  const { data: order, error } = await db()
    .from('orders')
    .insert({
      method,
      items,
      total_cents: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      customer: hasCustomer ? customer : null,
    })
    .select('*')
    .single<Order>()
  if (error) {
    console.error('[checkout] erro ao salvar pedido', error)
    return json({ error: 'Não foi possível criar o pedido' }, 500)
  }

  const site = process.env.SITE_URL ?? new URL(request.url).origin
  try {
    const url = await createCheckoutLink({
      order_nsu: order.id,
      items: items.map(({ quantity, price, description }) => ({ quantity, price, description })),
      redirect_url: `${site}/?pedido=${order.id}`,
      webhook_url: `${site}/api/infinitepay-webhook`,
      customer: hasCustomer ? customer : undefined,
    })
    await db().from('orders').update({ checkout_url: url }).eq('id', order.id)
    return json({ orderId: order.id, url })
  } catch (err) {
    console.error('[checkout] erro na InfinitePay', err)
    await db().from('orders').update({ status: 'canceled' }).eq('id', order.id)
    return json({ error: 'Não foi possível gerar o pagamento. Tente de novo ou fale com a gente no WhatsApp.' }, 502)
  }
}
