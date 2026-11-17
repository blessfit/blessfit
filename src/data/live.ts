/*
 * Preços e estoque “ao vivo”, vindos do Supabase (editados no painel /admin), aplicados sobre o catálogo.
 * Sem banco configurado (ou fora do ar) o site usa os valores de src/data/catalog.ts.
 */
import { stockPiecesOf, type CatalogProduct, type Size, type StockPiece } from './catalog'

export type LiveProduct = { price: number; pix: number; compareAt: number | null; active: boolean; freeShipping: boolean }

export type LiveCatalog = {
  products: Record<string, LiveProduct>
  /** Quantidade por `stockKey`; null (ou sem chave) = sem controle de estoque. */
  stock: Record<string, number | null>
}

export const stockKey = (productId: string, color: string, size: string) => `${productId}|${color}|${size}`

/** Quantidade gravada no banco para uma peça, ou null quando o tamanho não tem controle de estoque. */
export const pieceStock = (live: LiveCatalog | null, piece: StockPiece) =>
  live?.stock[stockKey(piece.id, piece.color, piece.size)] ?? null

/**
 * Quantidade em estoque, ou null quando o tamanho não tem controle de estoque.
 * Conjunto: quantos dá para montar, ou seja, a menor quantidade entre as duas peças (peça sem controle não limita).
 */
export function stockOf(live: LiveCatalog | null, productId: string, color: string, size: string): number | null {
  const counts = stockPiecesOf(productId, color, size)
    .map((piece) => pieceStock(live, piece))
    .filter((quantity) => quantity !== null)
  return counts.length ? Math.min(...counts) : null
}

type Shape = Pick<CatalogProduct, 'id' | 'price' | 'pix' | 'compareAt' | 'sizes' | 'soldOut' | 'freeShipping'> & {
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
    freeShipping: row ? row.freeShipping : product.freeShipping,
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
