import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireAdmin } from '@/server/auth'
import { signOut } from '../actions'
import s from '../admin.module.css'

export const metadata: Metadata = { title: 'Painel Blessfit', robots: { index: false } }

/** Moldura do painel. Só abre com login de administrador (ver src/server/auth.ts). */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin()

  return (
    <div className={s.shell}>
      <header className={s.header}>
        <span className={s.brand}>blessfit · painel</span>
        <nav className={s.nav} aria-label="Painel">
          <Link href="/admin">Pedidos</Link>
          <Link href="/admin/estoque">Estoque e preços</Link>
        </nav>
        <form action={signOut}>
          <button className={`${s.button} ${s.ghost}`} type="submit" title={user.email}>
            Sair
          </button>
        </form>
      </header>
      <main className={s.main}>{children}</main>
    </div>
  )
}
