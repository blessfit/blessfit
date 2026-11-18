import type { Product, Size, Variant } from '@/data/products'
import { SHOP } from '@/data/shop'
import { promoTier, inPromo, nextPromoTier } from './campaign'
import { whatsappUrl } from './links'
import { formatBRL } from './price'

export type BagLine = { product: Product; variant: Variant; size: Size; qty: number }

/** Desconto da Black Friday nas peças da sacola, em reais (cartão e Pix). `percent` 0 = sem promoção. */
export type BagPromo = {
  count: number
  percent: number
  card: number
  pix: number
  /** Próximo degrau (quantas peças faltam e quanto dá), ou null no máximo / fora da campanha. */
  next: { missing: number; percent: number } | null
}

/** Mesma conta do checkout (src/lib/campaign.ts): arredondada por unidade, em centavos. */
export function bagPromo(lines: BagLine[], blackFriday: boolean): BagPromo {
  const count = lines.reduce((n, l) => n + (inPromo(l.product) ? l.qty : 0), 0)
  const percent = blackFriday ? promoTier(count) : 0
  const off = (unit: (l: BagLine) => number) =>
    lines.reduce(
      (sum, l) => sum + (percent && inPromo(l.product) ? Math.round((Math.round(unit(l) * 100) * percent) / 100) * l.qty : 0),
      0,
    ) / 100
  return {
    count,
    percent,
    card: off((l) => l.product.price),
    pix: off((l) => l.product.pix),
    next: blackFriday ? nextPromoTier(count) : null,
  }
}

/**
 * Link de WhatsApp com todos os itens da sacola (nome, cor, tamanho e quantidade de cada um).
 * `freeFrom`: valor do frete grátis em reais; null = sem frete grátis por valor (Black Friday).
 * `promo`: desconto da Black Friday nas peças, que vai na mensagem com o total já descontado.
 */
export function checkoutUrl(lines: BagLine[], freeFrom: number | null = SHOP.freeShippingFrom, promo?: BagPromo): string {
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
  const discounted = promo && promo.percent > 0
  const message = [
    `Olá! Quero finalizar este pedido na ${SHOP.name}:`,
    '',
    ...items,
    ...(discounted
      ? [
          `Subtotal: ${formatBRL(total)} (ou ${formatBRL(pix)} no Pix)`,
          `Black Friday (${promo.count} peças, ${promo.percent}%): − ${formatBRL(promo.card)} (− ${formatBRL(promo.pix)} no Pix)`,
          `*Total: ${formatBRL(total - promo.card)}* (ou ${formatBRL(pix - promo.pix)} no Pix)`,
        ]
      : [`*Total: ${formatBRL(total)}* (ou ${formatBRL(pix)} no Pix)`]),
    ...(freeFrom !== null && total >= freeFrom ? ['Frete grátis ✓'] : []),
  ].join('\n')
  return whatsappUrl(message)
}
