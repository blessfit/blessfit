import type { Product, Size, Variant } from '@/data/products'
import { SHOP } from '@/data/shop'
import { whatsappUrl } from './links'
import { formatBRL, pixPrice } from './price'

export type BagLine = { product: Product; variant: Variant; size: Size; qty: number }

/** Link de WhatsApp com todos os itens da sacola (nome, cor, tamanho e quantidade de cada um). */
export function checkoutUrl(lines: BagLine[]): string {
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)
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
    `*Total: ${formatBRL(total)}* (ou ${formatBRL(pixPrice(total))} no Pix)`,
    ...(total >= SHOP.freeShippingFrom ? ['Frete grátis ✓'] : []),
  ].join('\n')
  return whatsappUrl(message)
}
