import { createContext, useContext } from 'react'
import type { InfoPage } from '@/data/content'
import type { Product, Size, Variant } from '@/data/products'
import type { BagLine } from '@/lib/orders'

export type Panel = 'bag' | 'menu'

/** Item da sacola. Quantidade 0 não remove: o item fica salvo (a sacola também serve de lista de desejos). */
export type BagItem = BagLine & { selected: boolean }

export type StoreState = {
  bag: BagItem[]
  /** Quantos itens diferentes estão salvos na sacola. */
  bagCount: number
  /** Itens marcados e com quantidade — os que vão para o pedido. */
  checkoutLines: BagLine[]
  /** Peças (soma das quantidades) que vão para o pedido. */
  checkoutCount: number
  bagTotal: number
  /** Total pagando no Pix. */
  bagPixTotal: number
  addToBag: (product: Product, variant: Variant, size: Size) => void
  setQty: (line: BagLine, qty: number) => void
  setSelected: (line: BagLine, selected: boolean) => void
  selectAll: (selected: boolean) => void
  removeFromBag: (line: BagLine) => void

  /** Gaveta aberta (sacola ou menu mobile). */
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
