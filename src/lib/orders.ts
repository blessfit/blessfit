import type { Product, Size, Variant } from '@/data/products'
import { SHOP } from '@/data/shop'
import { whatsappUrl } from './links'
import { formatBRL, pixPrice } from './price'

export type BagLine = { product: Product; variant: Variant; size: Size; qty: number }

/** Link de WhatsApp para comprar um produto direto (com ou sem tamanho escolhido). */
export function buyNowUrl(product: Product, variant: Variant, size?: Size): string {
  const lines = [
    `Olá! Quero comprar o *${product.name}* (Ref. ${product.ref}).`,
    `• Cor: ${variant.color.name}`,
    `• Tamanho: ${size ?? 'quero ajuda para escolher'}`,
    `• Valor: ${formatBRL(product.price)} (ou ${formatBRL(pixPrice(product.price))} no Pix)`,
  ]
  return whatsappUrl(lines.join('\n'))
}

/** Link de WhatsApp com todos os itens da sacola. */
export function checkoutUrl(lines: BagLine[]): string {
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)
  const items = lines.map(
    (l) =>
      `• ${l.qty}x ${l.product.name} (Ref. ${l.product.ref}) — ${l.variant.color.name}, tam. ${l.size} — ${formatBRL(l.product.price * l.qty)}`,
  )
  const message = [
    'Olá! Quero finalizar este pedido na Blessfit:',
    '',
    ...items,
    '',
    `Total: ${formatBRL(total)} (ou ${formatBRL(pixPrice(total))} no Pix)`,
    total >= SHOP.freeShippingFrom ? 'Frete grátis ✓' : 'Pode calcular o frete para o meu CEP?',
  ].join('\n')
  return whatsappUrl(message)
}
