'use client'

/*
 * Moldura das telas da conta (/conta/pedidos e /conta/dados): saudação, menu entre as telas e sair.
 * Fica no layout: ao trocar de tela só o conteúdo muda (navegação no cliente, com skeleton).
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Button, Spinner } from '@/components/ui'
import { useSignOut } from '@/hooks/useSignOut'
import * as S from './Account.styles'

const PAGES = [
  { href: '/conta/pedidos', label: 'Meus pedidos' },
  { href: '/conta/dados', label: 'Meus dados' },
]

export function AccountShell({ name, email, children }: { name: string; email: string; children: ReactNode }) {
  const pathname = usePathname()
  const [signingOut, signOut] = useSignOut()
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
            <Link key={page.href} href={page.href} aria-current={pathname === page.href ? 'page' : undefined}>
              {page.label}
            </Link>
          ))}
        </S.SideNav>
        <Button as="button" type="button" variant="outline" size="sm" block onClick={signOut} disabled={signingOut} aria-busy={signingOut}>
          {signingOut ? (
            <>
              <Spinner /> Saindo…
            </>
          ) : (
            'Sair da conta'
          )}
        </Button>
      </S.Side>
      <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>{children}</div>
    </S.AccountLayout>
  )
}
