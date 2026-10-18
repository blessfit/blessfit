import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { safeNext } from '@/lib/customer'
import { currentUser } from '@/server/customers'
import { LoginView } from '@/views/Account'
import { AccountApp } from '../providers/AccountApp'

export const metadata: Metadata = { title: 'Entrar · Blessfit', robots: { index: false } }

export default async function LoginRoute({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const { next, erro } = await searchParams
  const target = safeNext(next, '/')
  if (await currentUser()) redirect(target)

  return (
    <AccountApp crumb="Entrar">
      <LoginView next={target} error={erro} />
    </AccountApp>
  )
}
