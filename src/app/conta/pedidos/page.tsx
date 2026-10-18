import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser, getCustomer, listCustomerOrders } from '@/server/customers'
import { OrdersView } from '@/views/Account'
import { AccountApp } from '../../providers/AccountApp'

export const metadata: Metadata = { title: 'Meus pedidos · Blessfit', robots: { index: false } }

export default async function OrdersRoute() {
  const user = await currentUser()
  if (!user) redirect('/entrar?next=/conta/pedidos')
  const [customer, orders] = await Promise.all([getCustomer(user.id), listCustomerOrders(user.id)])

  return (
    <AccountApp crumb="Meus pedidos">
      <OrdersView name={customer?.name ?? ''} email={user.email ?? ''} orders={orders} />
    </AccountApp>
  )
}
