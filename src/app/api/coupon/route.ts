/*
 * POST /api/coupon — confere um cupom no carrinho.
 *
 * Corpo: { code: 'BLESS10', cpf?: '000.000.000-00' }
 * Resposta: { code, percent } ou 400 { error }. Com CPF, já confere se é a primeira compra
 * (o checkout confere de novo de qualquer jeito).
 */
import { digits, isCpf } from '@/lib/documents'
import { checkFirstPurchase, findCoupon } from '@/server/coupons'
import { json } from '@/server/orders'

export async function POST(request: Request): Promise<Response> {
  let body: { code?: unknown; cpf?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const coupon = typeof body.code === 'string' ? findCoupon(body.code) : null
  if (!coupon) return json({ error: 'Cupom inválido' }, 400)

  const cpf = typeof body.cpf === 'string' ? digits(body.cpf) : ''
  if (isCpf(cpf)) {
    try {
      const error = await checkFirstPurchase(coupon, cpf)
      if (error) return json({ error }, 400)
    } catch (err) {
      console.error('[cupom] erro ao conferir primeira compra', err)
    }
  }
  return json(coupon)
}
