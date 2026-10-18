import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser, getCustomer, listCustomerOrders } from '@/server/customers'
import { AccountView } from '@/views/Account'
import { AccountApp } from '../providers/AccountApp'

export const metadata: Metadata = { title: 'Minha conta · Blessfit', robots: { index: false } }

export default async function AccountRoute({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const user = await currentUser()
  if (!user) redirect('/entrar?next=/conta')
  const [customer, orders, { senha }] = await Promise.all([getCustomer(user.id), listCustomerOrders(user.id), searchParams])

  return (
    <AccountApp crumb="Minha conta">
      <AccountView email={user.email ?? ''} customer={customer} orders={orders} notice={senha === 'ok' ? 'Senha alterada.' : undefined} />
    </AccountApp>
  )
}
