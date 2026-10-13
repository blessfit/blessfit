/*
 * Produtos do site: o catálogo de src/data/catalog.ts (onde se editam nomes, preços, cores e tamanhos)
 * com as fotos de cada cor já resolvidas.
 */
import { CATALOG, type CatalogProduct, type Color } from './catalog'
import { IMAGES, type ProductImages } from './images'

export type { Color, Gender, Kind, Size } from './catalog'
export type Variant = { color: Color; images: ProductImages }
export type Product = Omit<CatalogProduct, 'variants'> & { variants: Variant[] }

export const PRODUCTS: Product[] = CATALOG.map((product) => ({
  ...product,
  variants: product.variants.map(({ color, images }) => ({ color, images: IMAGES.products[images] })),
}))

export const SETS = PRODUCTS.filter((p) => p.kind === 'Conjunto')
export const PIECES = PRODUCTS.filter((p) => p.kind !== 'Conjunto')

export const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id)

/** Variante (cor) pelo nome; cai na primeira se a cor não existir mais. */
export const findVariant = (product: Product, colorName?: string): Variant =>
  product.variants.find((variant) => variant.color.name === colorName) ?? product.variants[0]
