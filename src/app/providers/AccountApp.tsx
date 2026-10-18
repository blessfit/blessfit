'use client'

import type { ReactNode } from 'react'
import { CheckoutShell } from '@/views/Cart'
import { AppProviders } from './AppProviders'

/** Páginas da conta (/entrar, /criar-conta, /conta): mesmo topo e fundo do carrinho. */
export function AccountApp({ crumb, children }: { crumb: string; children: ReactNode }) {
  return (
    <AppProviders live={null}>
      <CheckoutShell crumb={crumb}>{children}</CheckoutShell>
    </AppProviders>
  )
}
