import type { Product, Size, Variant } from '@/data/products'
import { SHOP } from '@/data/shop'
import { whatsappUrl } from './links'
import { formatBRL } from './price'

export type BagLine = { product: Product; variant: Variant; size: Size; qty: number }

/**
 * Link de WhatsApp com todos os itens da sacola (nome, cor, tamanho e quantidade de cada um).
 * `freeFrom`: valor do frete grátis em reais; null = sem frete grátis por valor (Black Friday).
 */
export function checkoutUrl(lines: BagLine[], freeFrom: number | null = SHOP.freeShippingFrom): string {
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)
  const pix = lines.reduce((sum, l) => sum + l.product.pix * l.qty, 0)
  const items = lines.flatMap((l, i) => [
    `*${i + 1}. ${l.product.name}* (Ref. ${l.product.ref})`,
    `• Cor: ${l.variant.color.name}`,
    `• Tamanho: ${l.size}`,
    `• Quantidade: ${l.qty}`,
    `• Valor: ${formatBRL(l.product.price * l.qty)}`,
    '',
  ])
  const message = [
    `Olá! Quero finalizar este pedido na ${SHOP.name}:`,
    '',
    ...items,
    `*Total: ${formatBRL(total)}* (ou ${formatBRL(pix)} no Pix)`,
    ...(freeFrom !== null && total >= freeFrom ? ['Frete grátis ✓'] : []),
  ].join('\n')
  return whatsappUrl(message)
}
