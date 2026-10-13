/*
 * POST /api/infinitepay-webhook — aviso da InfinitePay de pagamento aprovado.
 *
 * O aviso não é assinado, então ele só serve de gatilho: o pagamento vale depois de confirmado
 * em /payment_check (confirmPayment). Responder 400 faz a InfinitePay tentar de novo.
 */
import { confirmPayment, findOrder, json } from '@/server/orders'

type Payload = { order_nsu?: unknown; transaction_nsu?: unknown; invoice_slug?: unknown; receipt_url?: unknown }

export async function POST(request: Request): Promise<Response> {
  let payload: Payload
  try {
    payload = (await request.json()) as Payload
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const { order_nsu, transaction_nsu, invoice_slug, receipt_url } = payload
  if (typeof order_nsu !== 'string' || typeof transaction_nsu !== 'string' || typeof invoice_slug !== 'string') {
    return json({ error: 'Campos obrigatórios ausentes' }, 400)
  }

  try {
    const order = await findOrder(order_nsu)
    if (!order) return json({ error: 'Pedido não encontrado' }, 400)

    const updated = await confirmPayment(order, {
      transaction_nsu,
      slug: invoice_slug,
      receipt_url: typeof receipt_url === 'string' ? receipt_url : undefined,
    })
    if (updated.status === 'pending') return json({ error: 'Pagamento ainda não confirmado' }, 400)

    console.log(`[webhook] pedido ${updated.id}: ${updated.status}`)
    return json({ ok: true })
  } catch (err) {
    console.error('[webhook] erro', err)
    return json({ error: 'Erro ao processar' }, 400)
  }
}
