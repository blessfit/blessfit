/*
 * POST /api/coupon — confere um cupom no carrinho.
 *
 * Corpo: { code: 'BLESS10', cpf?: '000.000.000-00' }
 * Resposta: { code, percent } ou 400 { error }. Com CPF, já confere se é a primeira compra
 * (o checkout confere tudo de novo de qualquer jeito).
 */
import { digits, isCpf } from '@/lib/documents'
import { checkCoupon, findCoupon } from '@/server/coupons'
import { json } from '@/server/orders'

export async function POST(request: Request): Promise<Response> {
  let body: { code?: unknown; cpf?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const cpf = typeof body.cpf === 'string' ? digits(body.cpf) : ''
  try {
    const coupon = typeof body.code === 'string' ? await findCoupon(body.code) : null
    if (!coupon) return json({ error: 'Cupom inválido' }, 400)
    const error = await checkCoupon(coupon, isCpf(cpf) ? cpf : null)
    if (error) return json({ error }, 400)
    // só o que o carrinho precisa: limite e validade ficam no servidor
    return json({ code: coupon.code, percent: coupon.percent })
  } catch (err) {
    console.error('[cupom] erro ao conferir o cupom', err instanceof Error ? err.message : err)
    return json({ error: 'Não deu para conferir o cupom agora. Tente de novo' }, 503)
  }
}
