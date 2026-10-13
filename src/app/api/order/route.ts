/*
 * GET /api/order?id=…[&transaction_nsu=…&slug=…&receipt_url=…] — situação do pedido.
 *
 * A InfinitePay devolve o cliente para `/?pedido=<id>&transaction_nsu=…&slug=…`. O site repassa
 * esses parâmetros para cá, e o pagamento é confirmado na hora, sem esperar o webhook.
 */
import { confirmPayment, findOrder, json } from '@/server/orders'

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams
  const id = params.get('id')
  if (!id) return json({ error: 'Informe o id do pedido' }, 400)

  try {
    let order = await findOrder(id)
    if (!order) return json({ error: 'Pedido não encontrado' }, 404)

    const transactionNsu = params.get('transaction_nsu')
    const slug = params.get('slug')
    if (order.status === 'pending' && transactionNsu && slug) {
      order = await confirmPayment(order, {
        transaction_nsu: transactionNsu,
        slug,
        receipt_url: params.get('receipt_url') ?? undefined,
      })
    }

    return json({
      id: order.id,
      status: order.status,
      method: order.method,
      total: order.total_cents / 100,
      items: order.items.map(({ description, quantity }) => ({ description, quantity })),
      receiptUrl: order.receipt_url,
    })
  } catch (err) {
    console.error('[order] erro', err)
    return json({ error: 'Erro ao consultar o pedido' }, 500)
  }
}
