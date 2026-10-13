import { CATALOG } from '@/data/catalog'
import { IMAGES } from '@/data/images'

/** URL da foto principal de um produto numa cor (ou na primeira cor, se a cor não existir mais). */
export function productPhoto(productId: string, color?: string): string | undefined {
  const product = CATALOG.find((p) => p.id === productId)
  if (!product) return undefined
  const variant = product.variants.find((v) => v.color.name === color) ?? product.variants[0]
  return IMAGES.products[variant.images].main.src
}
