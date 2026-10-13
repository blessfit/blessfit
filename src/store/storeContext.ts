import { createContext, useContext } from 'react'
import type { InfoPage } from '@/data/content'
import type { Product, Size, Variant } from '@/data/products'
import type { BagLine } from '@/lib/orders'

export type Panel = 'bag' | 'favorites' | 'menu'

export type StoreState = {
  favorites: Product[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (product: Product) => void

  bag: BagLine[]
  bagCount: number
  bagTotal: number
  /** Total da sacola pagando no Pix. */
  bagPixTotal: number
  addToBag: (product: Product, variant: Variant, size: Size) => void
  setQty: (line: BagLine, qty: number) => void

  /** Gaveta aberta (sacola, favoritos ou menu mobile). */
  panel: Panel | null
  openPanel: (panel: Panel) => void
  closePanel: () => void

  /** Produto (e cor) aberto na janela “visualizar”. */
  quickView: { product: Product; variant: Variant } | null
  openQuickView: (product: Product, variant?: Variant) => void
  closeQuickView: () => void

  /** Página de ajuda aberta pelo rodapé. */
  info: InfoPage['id'] | null
  openInfo: (id: InfoPage['id']) => void
  closeInfo: () => void
}

export const StoreContext = createContext<StoreState | null>(null)

export function useStore(): StoreState {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore precisa estar dentro de <StoreProvider>')
  return store
}
