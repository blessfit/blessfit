import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkCoupon, couponState, findCoupon, normalizeCode, parseCouponForm, type Coupon, type CouponForm } from './coupons'

/** Contagens que o banco devolve: usos do cupom (por coupon_code) e pedidos pagos do CPF (por customer_cpf). */
const db = vi.hoisted(() => ({ uses: 0, paid: 0, row: null as unknown, queries: [] as string[] }))

vi.mock('server-only', () => ({}))
vi.mock('./admin', () => ({ SOLD: ['paid', 'review', 'shipped', 'delivered'] }))
vi.mock('./supabase', () => ({
  db: () => ({
    from: () => ({
      select: () => ({
        eq: (column: string, value: string) => {
          db.queries.push(`${column}=${value}`)
          return {
            in: async () => ({ count: column === 'coupon_code' ? db.uses : db.paid, error: null }),
            maybeSingle: async () => ({ data: db.row, error: null }),
          }
        },
      }),
    }),
  }),
}))

const NOW = new Date('2026-11-11T12:00:00-03:00')
const coupon = (patch: Partial<Coupon> = {}): Coupon => ({
  code: 'BLESS10',
  percent: 10,
  max_uses: null,
  first_purchase_only: true,
  starts_at: null,
  ends_at: null,
  active: true,
  created_at: '2026-11-01T00:00:00Z',
  ...patch,
})

beforeEach(() => {
  db.uses = 0
  db.paid = 0
  db.row = null
  db.queries.length = 0
})

describe('couponState', () => {
  it.each([
    ['desligado', { active: false }, 0, 'inactive'],
    ['antes do início', { starts_at: '2026-11-12T00:00:00-03:00' }, 0, 'scheduled'],
    ['vencido', { ends_at: '2026-11-11T11:00:00-03:00' }, 0, 'expired'],
    ['no limite', { max_uses: 3 }, 3, 'exhausted'],
    ['acima do limite (dois pagamentos juntos)', { max_uses: 3 }, 4, 'exhausted'],
    ['abaixo do limite', { max_uses: 3 }, 2, 'active'],
    ['sem limite', {}, 500, 'active'],
    ['dentro da validade', { starts_at: '2026-11-01T00:00:00Z', ends_at: '2026-12-01T00:00:00Z' }, 0, 'active'],
  ] as const)('%s', (_, patch, uses, state) => {
    expect(couponState(coupon(patch), uses, NOW)).toBe(state)
  })

  it('desligado vence as outras situações', () => {
    expect(couponState(coupon({ active: false, max_uses: 1, ends_at: '2026-01-01T00:00:00Z' }), 5, NOW)).toBe('inactive')
  })
})

describe('checkCoupon', () => {
  it('desligado: não revela que o cupom existiu', async () => {
    expect(await checkCoupon(coupon({ active: false }), null, NOW)).toBe('Cupom inválido')
  })

  it('fora da validade', async () => {
    expect(await checkCoupon(coupon({ ends_at: '2026-11-01T00:00:00Z' }), null, NOW)).toMatch(/não está valendo/)
    expect(await checkCoupon(coupon({ starts_at: '2026-12-01T00:00:00Z' }), null, NOW)).toMatch(/não está valendo/)
  })

  it('esgotado: conta os pedidos pagos com o código', async () => {
    db.uses = 1
    expect(await checkCoupon(coupon({ max_uses: 1 }), null, NOW)).toBe('O cupom BLESS10 esgotou')
    expect(db.queries).toContain('coupon_code=BLESS10')
  })

  it('sem limite: nem consulta os usos', async () => {
    expect(await checkCoupon(coupon(), null, NOW)).toBeNull()
    expect(db.queries).not.toContain('coupon_code=BLESS10')
  })

  it('primeira compra: recusa CPF com pedido pago', async () => {
    db.paid = 1
    expect(await checkCoupon(coupon(), '09926651674', NOW)).toMatch(/só na primeira compra/)
  })

  it('sem "só primeira compra": o mesmo CPF usa de novo', async () => {
    db.paid = 3
    expect(await checkCoupon(coupon({ first_purchase_only: false }), '09926651674', NOW)).toBeNull()
  })

  it('sem CPF ainda: deixa a primeira compra para o checkout', async () => {
    db.paid = 1
    expect(await checkCoupon(coupon(), null, NOW)).toBeNull()
  })

  it('esgotado é recusado antes de conferir a primeira compra', async () => {
    db.uses = 2
    db.paid = 1
    expect(await checkCoupon(coupon({ max_uses: 2 }), '09926651674', NOW)).toMatch(/esgotou/)
  })
})

describe('parseCouponForm', () => {
  const form = (patch: Partial<CouponForm> = {}): CouponForm => ({ percent: '10', maxUses: '', startsAt: '', endsAt: '', firstPurchaseOnly: true, ...patch })

  it('cupom simples: sem limite e sem prazo', () => {
    expect(parseCouponForm(form())).toEqual({
      ok: true,
      fields: { percent: 10, max_uses: null, starts_at: null, ends_at: null, first_purchase_only: true },
    })
  })

  it('datas no horário de Brasília', () => {
    const result = parseCouponForm(form({ startsAt: '2026-11-20T10:00', endsAt: '2026-11-30T23:59', maxUses: '50' }))
    expect(result).toMatchObject({ ok: true, fields: { max_uses: 50, starts_at: '2026-11-20T13:00:00.000Z', ends_at: '2026-12-01T02:59:00.000Z' } })
  })

  it.each([
    ['desconto zero', { percent: '0' }, /1% a 90%/],
    ['desconto acima de 90', { percent: '95' }, /1% a 90%/],
    ['desconto com casas', { percent: '10,5' }, /1% a 90%/],
    ['desconto vazio', { percent: '' }, /1% a 90%/],
    ['limite zero', { maxUses: '0' }, /limite/],
    ['limite com texto', { maxUses: 'dez' }, /limite/],
    ['data fora do formato', { endsAt: '30/11/2026' }, /Data inválida/],
    ['fim antes do início', { startsAt: '2026-11-20T10:00', endsAt: '2026-11-19T10:00' }, /depois do início/],
  ])('recusa %s', (_, patch, error) => {
    expect(parseCouponForm(form(patch))).toEqual({ ok: false, error: expect.stringMatching(error) })
  })

  it('corpo fora do formato (a action é um endpoint público): recusa sem quebrar', () => {
    expect(parseCouponForm({ percent: 10, firstPurchaseOnly: 'sim' } as unknown as CouponForm).ok).toBe(false)
    expect(parseCouponForm(null as unknown as CouponForm).ok).toBe(false)
    expect(parseCouponForm(form({ firstPurchaseOnly: 'true' as unknown as boolean }))).toMatchObject({ fields: { first_purchase_only: false } })
  })
})

describe('findCoupon', () => {
  it('aceita minúsculas e espaços', async () => {
    db.row = coupon()
    expect(await findCoupon(' bless 10 ')).toEqual(coupon())
    expect(db.queries).toEqual(['code=BLESS10'])
  })

  it('código fora do formato: nem consulta o banco', async () => {
    expect(await findCoupon('x')).toBeNull()
    expect(await findCoupon("BLESS10' or 1=1")).toBeNull()
    expect(db.queries).toEqual([])
  })

  it('normalizeCode', () => {
    expect(normalizeCode('  bless10 ')).toBe('BLESS10')
  })
})
