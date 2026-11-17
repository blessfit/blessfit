'use client'

import type { LiveCatalog } from '@/data/live'
import type { Campaign } from '@/lib/campaign'
import { CartPage } from '@/views/Cart'
import { AppProviders } from '../providers/AppProviders'

/** Carrinho com os mesmos providers da loja (a sacola salva no navegador, os preços do painel e a campanha). */
export default function CartApp({ live, campaign }: { live: LiveCatalog | null; campaign: Campaign }) {
  return (
    <AppProviders live={live} campaign={campaign}>
      <CartPage />
    </AppProviders>
  )
}
