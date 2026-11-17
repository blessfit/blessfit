/*
 * POST /api/checkout — cria o pedido (itens + frete) e devolve o link de pagamento da InfinitePay.
 *
 * Corpo: {
 *   method: 'card' | 'pix',
 *   lines: [{ id, color, size, qty }],
 *   customer: { name, cpf, phone, email? },
 *   address: { cep, street, number, complement?, district, city, uf },
 *   shipping: { serviceId, price },  // a opção que o cliente viu em /api/shipping/quote
 *   coupon?: 'BLESS10'               // desconto só nos itens
 * }
 * Na Black Friday (ligada em /admin/campanha) as blusas ganham o desconto progressivo de src/lib/campaign.ts.
 * Cupom e promoção não somam: cada peça fica com o maior.
 * Resposta: { orderId, url } — o site manda o cliente para `url`.
 * O frete é cotado de novo aqui. Se a opção sumiu ou o preço mudou: 409 { code: 'shipping_changed', options }.
 */
import { CATALOG } from '@/data/catalog'
import { blouseCount, blouseTier, discountTotals, freeShippingFrom, isBlackFriday, isBlouse, lineDiscounts, type DiscountLine } from '@/lib/campaign'
import { digits, isCpf, normalizeCep } from '@/lib/documents'
import { ONLINE_CHECKOUT } from '@/lib/site'
import { getCampaign } from '@/server/campaign'
import { checkFirstPurchase, findCoupon } from '@/server/coupons'
import { currentUser, rememberCheckout } from '@/server/customers'
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
  coupon?: unknown
}

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

const text = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined

/**
 * URL do aviso de pagamento. Em Preview (HML) a Vercel protege o site com login: a chave de
 * "Protection Bypass for Automation" deixa só o webhook da InfinitePay passar.
 */
function webhookUrl(site: string): string {
  const url = new URL('/api/infinitepay-webhook', site)
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  if (bypass && process.env.VERCEL_ENV !== 'production') url.searchParams.set('x-vercel-protection-bypass', bypass)
  return url.toString()
}

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
  if (!ONLINE_CHECKOUT) return json({ error: 'Pagamento pelo site indisponível no momento. Finalize pelo WhatsApp.' }, 403)

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
  const email = text(body.customer?.email, 160)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'E-mail inválido' }, 400)

  const coupon = typeof body.coupon === 'string' && body.coupon.trim() ? findCoupon(body.coupon) : null
  if (typeof body.coupon === 'string' && body.coupon.trim() && !coupon) return json({ error: 'Cupom inválido' }, 400)
  if (coupon) {
    const error = await checkFirstPurchase(coupon, cpf)
    if (error) return json({ error }, 400)
  }

  const address = parseAddress(body.address)
  if (typeof address === 'string') return json({ error: address }, 400)

  const live = await getLiveCatalog()
  const priced = priceCart(body.lines, method, live)
  if ('error' in priced) return json({ error: priced.error }, 400)
  const { items } = priced
  // o frete é cotado no preço do cartão (frete grátis e valor declarado não mudam com a forma de pagamento)
  const atCardPrice = priceCart(body.lines, 'card', live)
  if ('error' in atCardPrice) return json({ error: atCardPrice.error }, 400)

  // Black Friday lida do banco agora (o painel pode ter desligado): desconto nas blusas e sem frete grátis por valor
  const blackFriday = isBlackFriday(await getCampaign())

  let quote
  try {
    quote = await quoteShipping(address.cep, atCardPrice.items, freeShippingFrom(blackFriday))
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
    email,
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

  // Black Friday: desconto progressivo nas blusas
  const discountLines: DiscountLine[] = items.map((item) => ({
    unitCents: item.price,
    qty: item.quantity,
    blouse: isBlouse(CATALOG.find((p) => p.id === item.id)),
  }))
  const promoPercent = blackFriday ? blouseTier(blouseCount(discountLines)) : 0
  const discounts = lineDiscounts(discountLines, { promoPercent, couponPercent: coupon?.percent ?? 0 })
  const totals = discountTotals(discountLines, discounts)
  const discount = totals.total
  // cupom que a promoção cobriu em todas as peças não conta como uso
  const usedCoupon = coupon && totals.coupon > 0 ? coupon : null

  // conta opcional: o dono do pedido vem só da sessão, nunca do corpo da requisição
  const user = await currentUser()

  const { data: order, error } = await db()
    .from('orders')
    .insert({
      ...(user && { user_id: user.id }),
      method,
      items,
      items_total_cents: itemsTotal,
      shipping_cents: shipping.priceCents,
      coupon_code: usedCoupon?.code ?? null,
      promo: totals.promo > 0 ? `black-friday-blusas-${promoPercent}` : null,
      discount_cents: discount,
      total_cents: itemsTotal - discount + shipping.priceCents,
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
  if (user) {
    await rememberCheckout(user.id, { name, cpf, phone, address }).catch((err) => console.error('[checkout] erro ao salvar o perfil', err))
  }

  const site = process.env.SITE_URL ?? new URL(request.url).origin
  try {
    const url = await createCheckoutLink({
      order_nsu: order.id,
      items: [
        // com desconto, ele já vai no preço de cada unidade (a InfinitePay não tem campo de desconto)
        ...items.map(({ quantity, price, description }, i) => {
          const d = discounts[i]
          if (!d.source) return { quantity, price, description }
          const label = d.source === 'promo' ? 'Black Friday' : coupon!.code
          return { quantity, price: price - d.unit, description: `${description} (${label} -${d.percent}%)` }
        }),
        ...(shipping.priceCents > 0
          ? [{ quantity: 1, price: shipping.priceCents, description: `Frete — ${shipping.carrier} ${shipping.name}`.trim() }]
          : []),
      ],
      redirect_url: `${site}/pedido/${order.id}`,
      webhook_url: webhookUrl(site),
      customer,
      address: {
        cep: address.cep,
        street: address.street,
        neighborhood: address.district,
        number: address.number,
        complement: address.complement,
      },
    })
    await db().from('orders').update({ checkout_url: url }).eq('id', order.id)
    return json({ orderId: order.id, url })
  } catch (err) {
    console.error('[checkout] erro na InfinitePay', err)
    await db().from('orders').update({ status: 'canceled' }).eq('id', order.id)
    return json({ error: 'Não foi possível gerar o pagamento. Tente de novo ou fale com a gente no WhatsApp.' }, 502)
  }
}
