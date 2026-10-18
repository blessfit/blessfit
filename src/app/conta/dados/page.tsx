import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser, getCustomer } from '@/server/customers'
import { ProfileView } from '@/views/Account'
import { AccountApp } from '../../providers/AccountApp'

export const metadata: Metadata = { title: 'Meus dados · Blessfit', robots: { index: false } }

export default async function ProfileRoute({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const user = await currentUser()
  if (!user) redirect('/entrar?next=/conta/dados')
  const [customer, { senha }] = await Promise.all([getCustomer(user.id), searchParams])

  return (
    <AccountApp crumb="Meus dados">
      <ProfileView email={user.email ?? ''} customer={customer} notice={senha === 'ok' ? 'Senha alterada.' : undefined} />
    </AccountApp>
  )
}
