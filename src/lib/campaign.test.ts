import { describe, expect, it } from 'vitest'
import { blouseCount, blouseTier, discountTotals, isBlackFriday, lineDiscounts, nextBlouseTier, type DiscountLine } from './campaign'

describe('isBlackFriday', () => {
  const now = new Date('2026-11-28T12:00:00-03:00')

  it('só vale ligada', () => {
    expect(isBlackFriday({ blackFriday: false, endsAt: null }, now)).toBe(false)
    expect(isBlackFriday({ blackFriday: true, endsAt: null }, now)).toBe(true)
    expect(isBlackFriday(null, now)).toBe(false)
  })

  it('desliga sozinha depois do fim', () => {
    expect(isBlackFriday({ blackFriday: true, endsAt: '2026-11-30T23:59:00-03:00' }, now)).toBe(true)
    expect(isBlackFriday({ blackFriday: true, endsAt: '2026-11-28T12:00:00-03:00' }, now)).toBe(false)
  })
})

describe('blouseTier', () => {
  it('segue a escada 2/3/4+ (máximo de 20%)', () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(blouseTier)).toEqual([0, 0, 10, 15, 20, 20, 20])
  })

  it('diz quanto falta para o próximo degrau', () => {
    expect(nextBlouseTier(1)).toEqual({ missing: 1, percent: 10 })
    expect(nextBlouseTier(3)).toEqual({ missing: 1, percent: 20 })
    expect(nextBlouseTier(4)).toBeNull()
  })
})

describe('lineDiscounts', () => {
  const lines: DiscountLine[] = [
    { unitCents: 6990, qty: 2, blouse: true }, // regatas no Pix
    { unitCents: 7490, qty: 1, blouse: true }, // top no Pix
    { unitCents: 12990, qty: 1, blouse: false }, // conjunto
  ]

  it('3 blusas: 15% só nas blusas', () => {
    const promoPercent = blouseTier(blouseCount(lines))
    expect(promoPercent).toBe(15)
    const d = lineDiscounts(lines, { promoPercent, couponPercent: 0 })
    expect(d.map((x) => x.unit)).toEqual([1049, 1124, 0])
    expect(discountTotals(lines, d)).toEqual({ promo: 1049 * 2 + 1124, coupon: 0, total: 1049 * 2 + 1124 })
  })

  it('cupom e promoção não somam: cada peça fica com o maior', () => {
    const d = lineDiscounts(lines, { promoPercent: 15, couponPercent: 10 })
    expect(d.map((x) => [x.source, x.percent])).toEqual([
      ['promo', 15],
      ['promo', 15],
      ['coupon', 10],
    ])
  })

  it('cupom maior que a promoção vale também nas blusas', () => {
    const d = lineDiscounts(lines, { promoPercent: 10, couponPercent: 20 })
    expect(d.every((x) => x.source === 'coupon' && x.percent === 20)).toBe(true)
  })

  it('sem promoção nem cupom não dá desconto', () => {
    const d = lineDiscounts(lines, { promoPercent: 0, couponPercent: 0 })
    expect(discountTotals(lines, d).total).toBe(0)
  })
})
