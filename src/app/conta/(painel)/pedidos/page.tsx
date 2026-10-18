import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser, listCustomerOrders } from '@/server/customers'
import { OrdersView } from '@/views/Account'

export const metadata: Metadata = { title: 'Meus pedidos · Blessfit', robots: { index: false } }

export default async function OrdersRoute() {
  const user = await currentUser()
  if (!user) redirect('/entrar?next=/conta/pedidos')
  return <OrdersView orders={await listCustomerOrders(user.id)} />
}
