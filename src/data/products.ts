/*
 * Produtos do site: o catálogo de src/data/catalog.ts (onde se editam nomes, preços, cores e tamanhos)
 * com as fotos de cada cor já resolvidas. Preços e estoque do painel entram por cima, em CatalogProvider.
 */
import { CATALOG, type CatalogProduct, type Color, type Size } from './catalog'
import { IMAGES, type ProductImages } from './images'

export type { Color, Gender, Kind, Size } from './catalog'
/** Cor do produto com as suas fotos e os tamanhos esgotados nela. */
export type Variant = { color: Color; images: ProductImages; soldOut?: Size[] }
export type Product = Omit<CatalogProduct, 'variants'> & { variants: Variant[] }

export const PRODUCTS: Product[] = CATALOG.map((product) => ({
  ...product,
  variants: product.variants.map((variant) => ({ ...variant, images: IMAGES.products[variant.images] })),
}))

export const isSet = (p: Product) => p.kind === 'Conjunto'

/** Variante (cor) pelo nome; cai na primeira se a cor não existir mais. */
export const findVariant = (product: Product, colorName?: string): Variant =>
  product.variants.find((variant) => variant.color.name === colorName) ?? product.variants[0]
