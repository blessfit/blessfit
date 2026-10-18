/*
 * GET /api/conta — dados do cliente logado para preencher o checkout, ou 401.
 * O /carrinho é estático (não lê cookies), então pergunta aqui depois de carregar.
 */
import { json } from '@/server/orders'
import { currentUser, getCustomer } from '@/server/customers'

export async function GET(): Promise<Response> {
  const user = await currentUser()
  if (!user) return json({ error: 'Não logado' }, 401)
  const customer = await getCustomer(user.id).catch(() => null)
  return json({
    email: user.email ?? '',
    name: customer?.name ?? '',
    cpf: customer?.cpf ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? null,
  })
}
