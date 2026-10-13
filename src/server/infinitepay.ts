/*
 * Cliente da API de checkout da InfinitePay.
 * Docs: https://www.infinitepay.io/checkout-documentacao
 *
 * A loja é identificada só pela InfiniteTag (INFINITEPAY_HANDLE), sem chave secreta. Por isso o
 * webhook não é assinado e todo pagamento é confirmado de novo em /payment_check antes de valer.
 */
const API = 'https://api.checkout.infinitepay.io'

/** Valores sempre em centavos (R$ 10,00 = 1000). */
export type CheckoutItem = { quantity: number; price: number; description: string }

export type CheckoutCustomer = { name?: string; email?: string; phone_number?: string }

export type PaymentCheck = {
  success: boolean
  paid: boolean
  amount: number
  paid_amount: number
  installments: number
  capture_method: 'credit_card' | 'pix'
}

function handle(): string {
  const tag = process.env.INFINITEPAY_HANDLE
  if (!tag) throw new Error('INFINITEPAY_HANDLE não configurado')
  return tag.replace(/^\$/, '')
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ handle: handle(), ...body }),
    signal: AbortSignal.timeout(10_000),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`InfinitePay ${path} respondeu ${res.status}: ${text.slice(0, 300)}`)
  return JSON.parse(text) as T
}

/** Cria o link de pagamento (cartão em até 12x ou Pix) e devolve a URL do checkout. */
export async function createCheckoutLink(input: {
  order_nsu: string
  items: CheckoutItem[]
  redirect_url: string
  webhook_url: string
  customer?: CheckoutCustomer
}): Promise<string> {
  const data = await post<{ url?: string }>('/links', input)
  if (!data.url) throw new Error(`InfinitePay /links sem url: ${JSON.stringify(data).slice(0, 300)}`)
  return data.url
}

/** Pergunta à InfinitePay se a transação do pedido foi mesmo paga. */
export const checkPayment = (ref: { order_nsu: string; transaction_nsu: string; slug: string }) =>
  post<PaymentCheck>('/payment_check', ref)
