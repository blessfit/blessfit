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
  const meta = user.user_metadata ?? {}
  return json({
    email: user.email ?? '',
    name: customer?.name ?? '',
    // foto do Google (login social); o header mostra a inicial quando não tem
    avatar: typeof meta.avatar_url === 'string' ? meta.avatar_url : '',
    cpf: customer?.cpf ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? null,
  })
}
