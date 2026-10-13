/*
 * Preços e estoque “ao vivo”, vindos do Supabase (editados no painel /admin), aplicados sobre o catálogo.
 * Sem banco configurado (ou fora do ar) o site usa os valores de src/data/catalog.ts.
 */
import type { CatalogProduct, Size } from './catalog'

export type LiveProduct = { price: number; pix: number; compareAt: number | null; active: boolean }

export type LiveCatalog = {
  products: Record<string, LiveProduct>
  /** Quantidade por `stockKey`; null (ou sem chave) = sem controle de estoque. */
  stock: Record<string, number | null>
}

export const stockKey = (productId: string, color: string, size: string) => `${productId}|${color}|${size}`

/** Quantidade em estoque, ou null quando o tamanho não tem controle de estoque. */
export const stockOf = (live: LiveCatalog | null, productId: string, color: string, size: string) =>
  live?.stock[stockKey(productId, color, size)] ?? null

type Shape = Pick<CatalogProduct, 'id' | 'price' | 'pix' | 'compareAt' | 'sizes' | 'soldOut'> & {
  variants: { color: { name: string }; soldOut?: Size[] }[]
}

/**
 * Aplica preços e estoque do banco num produto. Devolve null se o produto foi desativado no painel.
 * Cada cor ganha o seu `soldOut`: os esgotados do catálogo mais os tamanhos com estoque zerado.
 */
export function applyLive<P extends Shape>(product: P, live: LiveCatalog | null): P | null {
  const row = live?.products[product.id]
  if (row && !row.active) return null

  return {
    ...product,
    price: row?.price ?? product.price,
    pix: row?.pix ?? product.pix,
    compareAt: row ? (row.compareAt ?? undefined) : product.compareAt,
    variants: product.variants.map((variant) => ({
      ...variant,
      soldOut: product.sizes.filter(
        (size) =>
          product.soldOut?.includes(size) ||
          variant.soldOut?.includes(size) ||
          stockOf(live, product.id, variant.color.name, size) === 0,
      ),
    })),
  }
}
