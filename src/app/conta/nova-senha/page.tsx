import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { currentUser } from '@/server/customers'
import { NewPasswordView } from '@/views/Account'
import { AccountApp } from '../../providers/AccountApp'

export const metadata: Metadata = { title: 'Nova senha · Blessfit', robots: { index: false } }

export default async function NewPasswordRoute() {
  // a sessão vem do link de recuperação (/auth/confirm?type=recovery)
  if (!(await currentUser())) redirect('/entrar?erro=link')

  return (
    <AccountApp crumb="Nova senha">
      <NewPasswordView />
    </AccountApp>
  )
}
