'use client'

import type { LiveCatalog } from '@/data/live'
import { CartPage } from '@/views/Cart'
import { AppProviders } from '../providers/AppProviders'

/** Carrinho com os mesmos providers da loja (a sacola salva no navegador e os preços do painel). */
export default function CartApp({ live }: { live: LiveCatalog | null }) {
  return (
    <AppProviders live={live}>
      <CartPage />
    </AppProviders>
  )
}
