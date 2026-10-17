/*
 * Cliente da API do Melhor Envio (cotação, carrinho, compra com saldo, etiqueta, cancelamento e saldo).
 * Docs: https://docs.melhorenvio.com.br
 *
 * Autenticação por token pessoal gerado no painel do ME (um por ambiente) em MELHOR_ENVIO_TOKEN.
 * 🔎 Endpoints e campos conferidos contra a documentação antes de ir para produção (docs/spec-frete.md §8).
 * Nenhum tipo do ME sai deste arquivo: quem chama recebe centavos, gramas e centímetros.
 */
import 'server-only'
import type { Parcel } from './package'
import type { RawOption } from './pricing'

const BASE = { sandbox: 'https://sandbox.melhorenvio.com.br', production: 'https://melhorenvio.com.br' }

export class MelhorEnvioError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
  }
}

function config() {
  const env = process.env.MELHOR_ENVIO_ENV === 'production' ? 'production' : 'sandbox'
  const token = process.env.MELHOR_ENVIO_TOKEN
  const userAgent = process.env.MELHOR_ENVIO_USER_AGENT
  if (!token || !userAgent) throw new MelhorEnvioError('MELHOR_ENVIO_TOKEN / MELHOR_ENVIO_USER_AGENT não configurados')
  return { base: BASE[env], token, userAgent }
}

/** Primeira mensagem legível do corpo de erro do ME (ex.: { message, errors: { campo: [msg] } }). */
function errorMessage(text: string): string {
  try {
    const body = JSON.parse(text) as { message?: string; error?: string; errors?: Record<string, string[] | string> }
    const first = body.errors && Object.values(body.errors).flat()[0]
    return [body.message ?? body.error, first].filter(Boolean).join(': ') || text.slice(0, 300)
  } catch {
    return text.slice(0, 300)
  }
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: object, timeoutMs = 15_000): Promise<T> {
  const { base, token, userAgent } = config()
  const res = await fetch(`${base}/api/v2/me${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  })
  const text = await res.text()
  if (res.status === 401) throw new MelhorEnvioError('Token do Melhor Envio inválido ou expirado: gere um novo no painel do ME', 401)
  if (!res.ok) throw new MelhorEnvioError(errorMessage(text), res.status)
  return JSON.parse(text) as T
}

const reais = (cents: number) => Number((cents / 100).toFixed(2))
const toCents = (value: string | number) => Math.round(Number(value) * 100)
const volume = (p: Parcel) => ({ height: p.heightCm, width: p.widthCm, length: p.lengthCm, weight: p.weightG / 1000 })

type MeQuote = {
  id: number
  name: string
  price?: string
  custom_price?: string
  delivery_range?: { min: number; max: number }
  custom_delivery_range?: { min: number; max: number }
  company?: { name: string }
  error?: string
}

/**
 * Cotação para os serviços pedidos. Serviços que o ME devolve com erro (pacote fora do limite, CEP sem
 * atendimento) ou sem preço ficam de fora.
 */
export async function quote(input: { from: string; to: string; parcel: Parcel; services: number[]; timeoutMs?: number }): Promise<RawOption[]> {
  const data = await request<MeQuote[]>(
    'POST',
    '/shipment/calculate',
    {
      from: { postal_code: input.from },
      to: { postal_code: input.to },
      package: volume(input.parcel),
      options: { insurance_value: reais(input.parcel.insuranceCents), receipt: false, own_hand: false },
      services: input.services.join(','),
    },
    input.timeoutMs,
  )
  // 🔎 custom_price/custom_delivery_range = valores com as regras da conta; usar o preço "com desconto" real
  return data.flatMap((q) => {
    const price = q.custom_price ?? q.price
    const range = q.custom_delivery_range ?? q.delivery_range
    if (q.error || !price || !range) return []
    return [{ serviceId: q.id, name: q.name, carrier: q.company?.name ?? '', costCents: toCents(price), days: range }]
  })
}

export type Address = {
  name: string
  phone: string
  email?: string
  /** CPF do destinatário (só dígitos). */
  document?: string
  /** CNPJ e inscrição estadual do remetente. */
  companyDocument?: string
  stateRegister?: string
  street: string
  number: string
  complement?: string
  district: string
  city: string
  uf: string
  cep: string
}

const meAddress = (a: Address) => ({
  name: a.name,
  phone: a.phone,
  email: a.email,
  document: a.document,
  company_document: a.companyDocument,
  state_register: a.stateRegister,
  address: a.street,
  number: a.number,
  complement: a.complement,
  district: a.district,
  city: a.city,
  state_abbr: a.uf,
  country_id: 'BR',
  postal_code: a.cep,
})

/** Põe a etiqueta no carrinho do ME e devolve o id do pedido no ME. */
export async function addToCart(input: {
  serviceId: number
  from: Address
  to: Address
  parcel: Parcel
  products: { name: string; quantity: number; unitCents: number }[]
  nfeKey: string
  /** Id do pedido na loja: vira tag no ME, para achar o pedido de lá. */
  orderId: string
}): Promise<string> {
  const data = await request<{ id: string }>('POST', '/cart', {
    service: input.serviceId,
    from: meAddress(input.from),
    to: meAddress(input.to),
    products: input.products.map((p) => ({ name: p.name, quantity: p.quantity, unitary_value: reais(p.unitCents) })),
    volumes: [volume(input.parcel)],
    options: {
      insurance_value: reais(input.parcel.insuranceCents),
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: false,
      invoice: { key: input.nfeKey },
      platform: 'Blessfit',
      tags: [{ tag: input.orderId }],
    },
  })
  return data.id
}

export type MeOrder = {
  id: string
  status: string
  /** Quando foi pago com o saldo (null = ainda no carrinho). */
  paidAt: string | null
  generatedAt: string | null
  tracking: string | null
  costCents: number | null
}

type MeOrderBody = {
  id: string
  status: string
  price?: number | string
  paid_at?: string | null
  generated_at?: string | null
  tracking?: string | null
  self_tracking?: string | null
}

export async function getOrder(id: string): Promise<MeOrder> {
  const o = await request<MeOrderBody>('GET', `/orders/${encodeURIComponent(id)}`)
  return {
    id: o.id,
    status: o.status,
    paidAt: o.paid_at ?? null,
    generatedAt: o.generated_at ?? null,
    tracking: o.tracking ?? o.self_tracking ?? null,
    costCents: o.price === undefined ? null : toCents(o.price),
  }
}

/** Paga a etiqueta com o saldo da carteira do ME. */
export const checkout = (id: string) => request<unknown>('POST', '/shipment/checkout', { orders: [id] })

/** Gera a etiqueta (o código de rastreio pode demorar um pouco para aparecer). */
export const generate = (id: string) => request<unknown>('POST', '/shipment/generate', { orders: [id] })

/** URL do PDF da etiqueta (pode expirar: pedir de novo a cada impressão). */
export async function printUrl(id: string): Promise<string> {
  const data = await request<{ url?: string }>('POST', '/shipment/print', { mode: 'private', orders: [id] })
  if (!data.url) throw new MelhorEnvioError('O Melhor Envio não devolveu a URL da etiqueta')
  return data.url
}

/** Cancela a etiqueta (antes da postagem). O valor volta para o saldo do ME. 🔎 reason_id */
export const cancel = (id: string, description: string) =>
  request<unknown>('POST', '/shipment/cancel', { order: { id, reason_id: '2', description } })

/** Saldo da carteira, em centavos. */
export async function balance(): Promise<number> {
  const data = await request<{ balance: number | string }>('GET', '/balance')
  return toCents(data.balance)
}
