import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { safeNext } from '@/lib/customer'
import { currentUser } from '@/server/customers'
import { SignUpView } from '@/views/Account'
import { AccountApp } from '../providers/AccountApp'

export const metadata: Metadata = { title: 'Criar conta · Blessfit', robots: { index: false } }

export default async function SignUpRoute({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const target = safeNext((await searchParams).next)
  if (await currentUser()) redirect(target)

  return (
    <AccountApp crumb="Criar conta">
      <SignUpView next={target} />
    </AccountApp>
  )
}
