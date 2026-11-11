/*
 * POST /api/coupon — prévia do cupom no carrinho.
 *
 * Corpo: { code: 'BLESS10' }
 * Resposta: { code, percent } ou 400 { error }. Não confere a primeira compra: com um CPF qualquer, a resposta
 * diria se a pessoa já comprou na loja (docs/seguranca.md). O checkout confere tudo de novo.
 */
import { checkCoupon, findCoupon } from '@/server/coupons'
import { json } from '@/server/orders'

export async function POST(request: Request): Promise<Response> {
  let body: { code?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  try {
    const coupon = typeof body.code === 'string' ? await findCoupon(body.code) : null
    if (!coupon) return json({ error: 'Cupom inválido' }, 400)
    const error = await checkCoupon(coupon, null)
    if (error) return json({ error }, 400)
    // só o que o carrinho precisa: limite e validade ficam no servidor
    return json({ code: coupon.code, percent: coupon.percent })
  } catch (err) {
    console.error('[cupom] erro ao conferir o cupom', err instanceof Error ? err.message : err)
    return json({ error: 'Não deu para conferir o cupom agora. Tente de novo' }, 503)
  }
}
