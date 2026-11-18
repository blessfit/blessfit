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

/** Pedido montado no /carrinho (mesmos passos da compra pelo site) para finalizar pelo WhatsApp. */
export type WhatsAppOrder = {
  lines: BagLine[]
  customer: { name: string; phone: string; cpf: string; email: string }
  address: { cep: string; street: string; number: string; complement: string; district: string; city: string; uf: string }
  shipping: { name: string; price: number; free: boolean; days: string }
  method: 'pix' | 'card'
  /** Valores em centavos, já na forma de pagamento escolhida (o mesmo resumo da tela). */
  totals: { items: number; promo: number; promoLabel?: string; shipping: number; total: number }
  installments: number
}

/**
 * Link de WhatsApp com o pedido completo: itens, dados da cliente, endereço, frete e forma de pagamento.
 * A loja confere e manda o link de pagamento pelo WhatsApp.
 */
export function whatsappOrderUrl(order: WhatsAppOrder): string {
  const brl = (centavos: number) => formatBRL(centavos / 100)
  const unit = (l: BagLine) => (order.method === 'pix' ? l.product.pix : l.product.price)
  const { customer: c, address: a, shipping: s, totals: t } = order
  const items = order.lines.flatMap((l, i) => [
    `*${i + 1}. ${l.product.name}* (Ref. ${l.product.ref})`,
    `• ${l.variant.color.name} · Tam. ${l.size} · ${l.qty} un.`,
    `• ${formatBRL(unit(l) * l.qty)}`,
  ])
  const pay =
    order.method === 'pix'
      ? 'Pix (à vista)'
      : `Cartão de crédito (até ${order.installments}x de ${brl(Math.floor(t.total / order.installments))} sem juros)`
  const message = [
    `Olá! Quero finalizar este pedido na ${SHOP.name}:`,
    '',
    '*🛍️ Peças*',
    ...items,
    '',
    '*👤 Meus dados*',
    `Nome: ${c.name.trim()}`,
    `CPF: ${c.cpf}`,
    `Celular: ${c.phone}`,
    `E-mail: ${c.email.trim()}`,
    '',
    '*📦 Endereço de entrega*',
    `${a.street.trim()}, ${a.number.trim()}${a.complement.trim() ? ` – ${a.complement.trim()}` : ''}`,
    `${a.district.trim()} – ${a.city.trim()}/${a.uf}`,
    `CEP ${a.cep}`,
    '',
    '*🚚 Envio*',
    `${s.name} – ${s.free ? 'Grátis' : formatBRL(s.price)} (${s.days})`,
    '',
    '*💳 Pagamento*',
    pay,
    '',
    `Subtotal: ${brl(t.items)}`,
    ...(t.promo > 0 ? [`${t.promoLabel ?? 'Desconto'}: − ${brl(t.promo)}`] : []),
    `Frete: ${s.free ? 'Grátis' : brl(t.shipping)}`,
    `*Total: ${brl(t.total)}*`,
  ].join('\n')
  return whatsappUrl(message)
}
