'use client'

/*
 * Moldura das telas da conta (/conta/pedidos e /conta/dados): saudação, menu entre as telas e sair.
 */
import type { ReactNode } from 'react'
import { Button } from '@/components/ui'
import { signOut } from '@/app/conta/actions'
import * as S from './Account.styles'

const PAGES = [
  { href: '/conta/pedidos', label: 'Meus pedidos' },
  { href: '/conta/dados', label: 'Meus dados' },
] as const

export type AccountPage = (typeof PAGES)[number]['href']

export function AccountShell({
  active,
  name,
  email,
  children,
}: {
  active: AccountPage
  name: string
  email: string
  children: ReactNode
}) {
  const firstName = name.trim().split(/\s+/)[0]
  return (
    <S.AccountLayout>
      <S.Side aria-label="Sua conta">
        <div>
          <S.Subtitle>{firstName ? `Olá, ${firstName}!` : 'Olá!'}</S.Subtitle>
          <S.Lead style={{ marginTop: 4, wordBreak: 'break-all' }}>{email}</S.Lead>
        </div>
        <S.SideNav aria-label="Telas da conta">
          {PAGES.map((page) => (
            <a key={page.href} href={page.href} aria-current={page.href === active ? 'page' : undefined}>
              {page.label}
            </a>
          ))}
        </S.SideNav>
        <form action={signOut}>
          <Button as="button" type="submit" variant="outline" size="sm" block>
            Sair da conta
          </Button>
        </form>
      </S.Side>
      <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>{children}</div>
    </S.AccountLayout>
  )
}
