'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { signOut } from '../actions'
import s from '../admin.module.css'
import { BoxIcon, HomeIcon, LogoutIcon, OrdersIcon, TagIcon } from './Icons'
import { SubmitButton } from './Pending'

type Counts = { orders: number; restock: number }

const LINKS: { href: string; label: string; short: string; icon: ReactNode; count?: keyof Counts }[] = [
  { href: '/admin', label: 'Início', short: 'Início', icon: <HomeIcon /> },
  { href: '/admin/pedidos', label: 'Pedidos', short: 'Pedidos', icon: <OrdersIcon />, count: 'orders' },
  { href: '/admin/estoque', label: 'Estoque', short: 'Estoque', icon: <BoxIcon />, count: 'restock' },
  { href: '/admin/precos', label: 'Preços', short: 'Preços', icon: <TagIcon /> },
]

const isActive = (pathname: string, href: string) =>
  href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

const Logo = () => (
  <Link href="/admin" className={s.logo}>
    blessfit <small>painel</small>
  </Link>
)

const SignOut = ({ label = 'Sair' }: { label?: string }) => (
  <form action={signOut}>
    <SubmitButton className={s.signOut} pendingLabel="Saindo…">
      <LogoutIcon /> {label}
    </SubmitButton>
  </form>
)

/** Menu do painel: lateral no computador; no celular, barra no topo e navegação embaixo. */
export function AdminNav({ email, counts }: { email: string; counts: Counts }) {
  const pathname = usePathname()
  const badge = (key?: keyof Counts) =>
    key && counts[key] > 0 ? <span className={s.navCount}>{counts[key]}</span> : null

  return (
    <>
      <aside className={s.sidebar}>
        <Logo />
        <nav aria-label="Painel">
          <ul className={s.navList}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={s.navLink}
                  aria-current={isActive(pathname, link.href) ? 'page' : undefined}
                >
                  {link.icon}
                  {link.label}
                  {badge(link.count)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={s.sidebarFoot}>
          <span className={s.who} title={email}>
            {email}
          </span>
          <SignOut />
        </div>
      </aside>

      <header className={s.topbar}>
        <Logo />
        <SignOut />
      </header>

      <nav className={s.bottomNav} aria-label="Painel">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? 'page' : undefined}>
            {link.icon}
            {link.short}
            {badge(link.count)}
          </Link>
        ))}
      </nav>
    </>
  )
}
