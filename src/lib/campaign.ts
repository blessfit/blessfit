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
 * Na Black Friday ele sai (a margem já vai no desconto das blusas). Produto marcado com frete grátis
 * no painel → Preços continua valendo.
 */
export const freeShippingFrom = (blackFriday: boolean): number | null => (blackFriday ? null : SHOP.freeShippingFrom)

/** Desconto progressivo nas blusas avulsas: quantidade mínima de blusas → % de desconto. */
export const BLOUSE_TIERS = [
  { min: 2, percent: 10 },
  { min: 3, percent: 15 },
  { min: 4, percent: 20 },
] as const

export const MAX_BLOUSE_PERCENT = BLOUSE_TIERS[BLOUSE_TIERS.length - 1].percent

/** Só blusas vendidas sozinhas entram na conta (a blusa dentro de um conjunto não conta). */
export const isBlouse = (product: { kind: string } | undefined) => product?.kind === 'Blusa'

/** % de desconto para esta quantidade de blusas (0 abaixo de 2). */
export function blouseTier(count: number): number {
  let percent = 0
  for (const tier of BLOUSE_TIERS) if (count >= tier.min) percent = tier.percent
  return percent
}

/** Próximo degrau: quantas blusas faltam e quanto ele dá. null quando já está no máximo. */
export function nextBlouseTier(count: number): { missing: number; percent: number } | null {
  const next = BLOUSE_TIERS.find((tier) => count < tier.min)
  return next ? { missing: next.min - count, percent: next.percent } : null
}

/** Uma linha do pedido para o cálculo: preço de uma unidade em centavos, quantidade e se é blusa. */
export type DiscountLine = { unitCents: number; qty: number; blouse: boolean }

export type LineDiscount = {
  /** Desconto de uma unidade, em centavos. */
  unit: number
  /** De onde veio: a promoção das blusas, o cupom, ou nenhum. */
  source: 'promo' | 'coupon' | null
  percent: number
}

/**
 * Desconto de cada linha. Promoção e cupom não somam: cada peça fica com o maior dos dois
 * (empate fica com a promoção). Arredondado por unidade, igual no site e na InfinitePay.
 */
export function lineDiscounts(lines: DiscountLine[], opts: { promoPercent: number; couponPercent: number }): LineDiscount[] {
  return lines.map((line) => {
    const promo = line.blouse ? opts.promoPercent : 0
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

/** Quantas blusas tem nas linhas. */
export const blouseCount = (lines: DiscountLine[]) => lines.reduce((n, l) => n + (l.blouse ? l.qty : 0), 0)
