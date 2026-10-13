import { createContext, useContext } from 'react'
import type { Product } from '@/data/products'

/** Catálogo com os preços e o estoque do painel já aplicados (produtos desativados ficam de fora). */
export type CatalogState = {
  products: Product[]
  sets: Product[]
  pieces: Product[]
  findProduct: (id: string) => Product | undefined
}

export const CatalogContext = createContext<CatalogState | null>(null)

export function useCatalog(): CatalogState {
  const catalog = useContext(CatalogContext)
  if (!catalog) throw new Error('useCatalog precisa estar dentro de <CatalogProvider>')
  return catalog
}
