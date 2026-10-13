import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { pendingCounts, restockList } from '@/server/admin'
import { requireAdmin } from '@/server/auth'
import { getLiveCatalog } from '@/server/supabase'
import { AdminNav } from '../_components/AdminNav'
import s from '../admin.module.css'

export const metadata: Metadata = { title: 'Painel Blessfit', robots: { index: false } }

/** Moldura do painel. Só abre com login de administrador (ver src/server/auth.ts). */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin()
  const [pending, live] = await Promise.all([pendingCounts(), getLiveCatalog()])

  return (
    <div className={`${s.root} ${s.shell}`}>
      <AdminNav
        email={user.email ?? ''}
        counts={{ orders: pending.toShip + pending.toReview, restock: restockList(live).length }}
      />
      <main className={s.content}>{children}</main>
    </div>
  )
}
