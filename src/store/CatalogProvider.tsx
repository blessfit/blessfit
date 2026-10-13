import { useMemo, type ReactNode } from 'react'
import { applyLive, type LiveCatalog } from '@/data/live'
import { isSet, PRODUCTS } from '@/data/products'
import { CatalogContext, type CatalogState } from './catalogContext'

/** Aplica sobre o catálogo os preços e o estoque que a página trouxe do banco. */
export function CatalogProvider({ live, children }: { live: LiveCatalog | null; children: ReactNode }) {
  const value = useMemo<CatalogState>(() => {
    const products = PRODUCTS.flatMap((product) => applyLive(product, live) ?? [])
    return {
      products,
      sets: products.filter(isSet),
      pieces: products.filter((p) => !isSet(p)),
      findProduct: (id) => products.find((p) => p.id === id),
    }
  }, [live])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
