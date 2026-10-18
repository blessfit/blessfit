import { createContext, useContext } from 'react'
import type { InfoPage } from '@/data/content'
import type { Product, Size, Variant } from '@/data/products'
import type { BagLine } from '@/lib/orders'

export type Panel = 'bag' | 'menu'

/**
 * Item da sacola. Quantidade 0 não remove: o item fica salvo (a sacola também serve de lista de desejos).
 * `size` null = entrou sem tamanho (ex.: “comprar o look” de uma avaliação); a pessoa escolhe na sacola.
 */
export type BagItem = Omit<BagLine, 'size'> & { size: Size | null; selected: boolean }

/** O que identifica um item da sacola: produto, cor e tamanho. */
export type BagKey = Pick<BagItem, 'product' | 'variant' | 'size'>

export type StoreState = {
  bag: BagItem[]
  /** Quantos itens diferentes estão salvos na sacola. */
  bagCount: number
  /** Itens marcados, com quantidade e tamanho — os que vão para o pedido. */
  checkoutLines: BagLine[]
  /** Itens marcados que ainda esperam a escolha do tamanho (ficam fora do pedido até lá). */
  needSize: BagItem[]
  /** Peças (soma das quantidades) que vão para o pedido. */
  checkoutCount: number
  bagTotal: number
  /** Total pagando no Pix. */
  bagPixTotal: number
  /** Sem `size`, a peça entra sem tamanho e a pessoa escolhe na sacola. */
  addToBag: (product: Product, variant: Variant, size?: Size | null) => void
  setQty: (line: BagKey, qty: number) => void
  setSize: (line: BagKey, size: Size) => void
  setSelected: (line: BagKey, selected: boolean) => void
  selectAll: (selected: boolean) => void
  removeFromBag: (line: BagKey) => void

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
