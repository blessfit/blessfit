/*
 * POST /api/checkout — cria o pedido (itens + frete) e devolve o link de pagamento da InfinitePay.
 *
 * Corpo: {
 *   method: 'card' | 'pix',
 *   lines: [{ id, color, size, qty }],
 *   customer: { name, cpf, phone, email? },
 *   address: { cep, street, number, complement?, district, city, uf },
 *   shipping: { serviceId, price }   // a opção que o cliente viu em /api/shipping/quote
 * }
 * Resposta: { orderId, url } — o site manda o cliente para `url`.
 * O frete é cotado de novo aqui. Se a opção sumiu ou o preço mudou: 409 { code: 'shipping_changed', options }.
 */
import { digits, isCpf, normalizeCep } from '@/lib/documents'
import { createCheckoutLink, type CheckoutCustomer } from '@/server/infinitepay'
import { json, priceCart, type Order, type OrderShipping, type PayMethod, type ShippingAddress } from '@/server/orders'
import { publicOption, quoteShipping } from '@/server/shipping/quote'
import { db, getLiveCatalog } from '@/server/supabase'

type Body = {
  method?: unknown
  lines?: unknown
  customer?: { name?: unknown; email?: unknown; phone?: unknown; cpf?: unknown }
  address?: Record<string, unknown>
  shipping?: { serviceId?: unknown; price?: unknown }
}

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

const text = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined

function parseAddress(raw: Record<string, unknown> | undefined): ShippingAddress | string {
  const cep = typeof raw?.cep === 'string' ? normalizeCep(raw.cep) : null
  if (!cep) return 'CEP inválido'
  const address = {
    cep,
    street: text(raw?.street, 120),
    number: text(raw?.number, 10),
    complement: text(raw?.complement, 60),
    district: text(raw?.district, 60),
    city: text(raw?.city, 60),
    uf: text(raw?.uf, 2)?.toUpperCase(),
  }
  if (!address.street || !address.number || !address.district || !address.city) return 'Endereço incompleto'
  if (!address.uf || !UFS.includes(address.uf)) return 'UF inválida'
  return address as ShippingAddress
}

export async function POST(request: Request): Promise<Response> {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  if (body.method !== 'card' && body.method !== 'pix') return json({ error: 'Forma de pagamento inválida' }, 400)
  const method: PayMethod = body.method

  const name = text(body.customer?.name, 120)
  const cpf = typeof body.customer?.cpf === 'string' ? digits(body.customer.cpf) : ''
  const phone = text(body.customer?.phone, 20)?.replace(/\D/g, '')
  if (!name) return json({ error: 'Informe o nome' }, 400)
  if (!isCpf(cpf)) return json({ error: 'CPF inválido' }, 400)
  if (!phone || phone.length < 10) return json({ error: 'Informe um telefone com DDD' }, 400)

  const address = parseAddress(body.address)
  if (typeof address === 'string') return json({ error: address }, 400)

  const live = await getLiveCatalog()
  const priced = priceCart(body.lines, method, live)
  if ('error' in priced) return json({ error: priced.error }, 400)
  const { items } = priced
  // o frete é cotado no preço do cartão (frete grátis e valor declarado não mudam com a forma de pagamento)
  const atCardPrice = priceCart(body.lines, 'card', live)
  if ('error' in atCardPrice) return json({ error: atCardPrice.error }, 400)

  let quote
  try {
    quote = await quoteShipping(address.cep, atCardPrice.items)
  } catch (err) {
    console.error('[checkout] erro na cotação do frete', err)
    return json({ error: 'Não foi possível calcular o frete' }, 500)
  }
  const option = quote.options.find((o) => o.serviceId === body.shipping?.serviceId)
  if (!option || typeof body.shipping?.price !== 'number' || Math.round(body.shipping.price * 100) !== option.priceCents) {
    return json(
      { error: 'O frete mudou. Confira as opções de novo.', code: 'shipping_changed', options: quote.options.map(publicOption) },
      409,
    )
  }

  const customer: CheckoutCustomer = {
    name,
    email: text(body.customer?.email, 160),
    phone_number: `+${phone.startsWith('55') ? phone : `55${phone}`}`,
  }
  const shipping: OrderShipping = {
    serviceId: option.serviceId,
    name: option.name,
    carrier: option.carrier,
    priceCents: option.priceCents,
    costCents: option.costCents,
    days: option.days,
    source: quote.source,
    parcel: quote.parcel,
  }
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const { data: order, error } = await db()
    .from('orders')
    .insert({
      method,
      items,
      items_total_cents: itemsTotal,
      shipping_cents: shipping.priceCents,
      total_cents: itemsTotal + shipping.priceCents,
      customer,
      customer_cpf: cpf,
      shipping,
      shipping_address: address,
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
      items: [
        ...items.map(({ quantity, price, description }) => ({ quantity, price, description })),
        ...(shipping.priceCents > 0
          ? [{ quantity: 1, price: shipping.priceCents, description: `Frete — ${shipping.carrier} ${shipping.name}`.trim() }]
          : []),
      ],
      redirect_url: `${site}/?pedido=${order.id}`,
      webhook_url: `${site}/api/infinitepay-webhook`,
      customer,
    })
    await db().from('orders').update({ checkout_url: url }).eq('id', order.id)
    return json({ orderId: order.id, url })
  } catch (err) {
    console.error('[checkout] erro na InfinitePay', err)
    await db().from('orders').update({ status: 'canceled' }).eq('id', order.id)
    return json({ error: 'Não foi possível gerar o pagamento. Tente de novo ou fale com a gente no WhatsApp.' }, 502)
  }
}
