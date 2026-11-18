/*
 * Campanha sazonal da loja (Black Friday), ligada e desligada pelo painel em /admin/campanha.
 *
 * Desligada, o site volta exatamente ao normal: o tema, o banner e os descontos só existem enquanto
 * `blackFriday` estiver ligado e antes de `endsAt`. As regras do desconto ficam aqui para o carrinho
 * (prévia) e o checkout (valor cobrado) calcularem igual.
 */
import { SHOP } from '@/data/shop'

/** Como fica salvo no banco (site_settings, chave 'campaign'). */
export type Campaign = {
  blackFriday: boolean
  /** Fim automático (ISO). null = só termina quando desligar no painel. */
  endsAt: string | null
}

export const NO_CAMPAIGN: Campaign = { blackFriday: false, endsAt: null }

/** A Black Friday está valendo agora? Depois de `endsAt` desliga sozinha, mesmo sem ninguém mexer no painel. */
export const isBlackFriday = (campaign: Campaign | null | undefined, now = new Date()): boolean =>
  !!campaign?.blackFriday && (!campaign.endsAt || now < new Date(campaign.endsAt))

/**
 * Valor mínimo (em reais) para o frete grátis, ou null quando não há frete grátis por valor.
 * Na Black Friday ele sai (a margem já vai no desconto progressivo). Produto marcado com frete grátis
 * no painel → Preços continua valendo.
 */
export const freeShippingFrom = (blackFriday: boolean): number | null => (blackFriday ? null : SHOP.freeShippingFrom)

/** Desconto progressivo em todas as peças: quantidade mínima de peças → % de desconto. */
export const PROMO_TIERS = [
  { min: 2, percent: 10 },
  { min: 3, percent: 15 },
  { min: 4, percent: 20 },
] as const

export const MAX_PROMO_PERCENT = PROMO_TIERS[PROMO_TIERS.length - 1].percent

/** Todas as peças entram na promoção (blusas, shorts, leggings e conjuntos; um conjunto conta como 1 peça). */
export const inPromo = (product: { kind: string } | undefined) => !!product

/** % de desconto para esta quantidade de peças (0 abaixo de 2). */
export function promoTier(count: number): number {
  let percent = 0
  for (const tier of PROMO_TIERS) if (count >= tier.min) percent = tier.percent
  return percent
}

/** Próximo degrau: quantas peças faltam e quanto ele dá. null quando já está no máximo. */
export function nextPromoTier(count: number): { missing: number; percent: number } | null {
  const next = PROMO_TIERS.find((tier) => count < tier.min)
  return next ? { missing: next.min - count, percent: next.percent } : null
}

/** Uma linha do pedido para o cálculo: preço de uma unidade em centavos, quantidade e se entra na promoção. */
export type DiscountLine = { unitCents: number; qty: number; inPromo: boolean }

export type LineDiscount = {
  /** Desconto de uma unidade, em centavos. */
  unit: number
  /** De onde veio: a promoção progressiva, o cupom, ou nenhum. */
  source: 'promo' | 'coupon' | null
  percent: number
}

/**
 * Desconto de cada linha. Promoção e cupom não somam: cada peça fica com o maior dos dois
 * (empate fica com a promoção). Arredondado por unidade, igual no site e na InfinitePay.
 */
export function lineDiscounts(lines: DiscountLine[], opts: { promoPercent: number; couponPercent: number }): LineDiscount[] {
  return lines.map((line) => {
    const promo = line.inPromo ? opts.promoPercent : 0
    const percent = Math.max(promo, opts.couponPercent)
    if (percent <= 0) return { unit: 0, source: null, percent: 0 }
    return {
      unit: Math.round((line.unitCents * percent) / 100),
      source: promo > 0 && promo >= opts.couponPercent ? 'promo' : 'coupon',
      percent,
    }
  })
}

/** Total de desconto separado por origem, em centavos. */
export function discountTotals(lines: DiscountLine[], discounts: LineDiscount[]) {
  let promo = 0
  let coupon = 0
  discounts.forEach((d, i) => {
    const value = d.unit * lines[i].qty
    if (d.source === 'promo') promo += value
    else if (d.source === 'coupon') coupon += value
  })
  return { promo, coupon, total: promo + coupon }
}

/** Quantas peças da promoção tem nas linhas. */
export const promoCount = (lines: DiscountLine[]) => lines.reduce((n, l) => n + (l.inPromo ? l.qty : 0), 0)
