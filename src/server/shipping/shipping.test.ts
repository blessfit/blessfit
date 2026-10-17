import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FALLBACK, HANDLING_DAYS, PACKAGING } from '@/data/shipping'
import type { OrderItem } from '../orders'
import * as melhorEnvio from './melhor-envio'
import { buildParcel } from './package'
import { applyRules, type RawOption } from './pricing'
import { quoteShipping } from './quote'

vi.mock('./melhor-envio', () => ({ quote: vi.fn() }))

const option = (serviceId: number, costCents: number, max: number): RawOption => ({
  serviceId,
  name: `S${serviceId}`,
  carrier: 'Correios',
  costCents,
  days: { min: 1, max },
})

describe('buildParcel', () => {
  it('soma as peças no envelope e respeita o peso mínimo', () => {
    const parcel = buildParcel([{ kind: 'Blusa', quantity: 1, price: 8990 }])
    expect(parcel).toEqual({ weightG: PACKAGING.minWeightG, lengthCm: 30, widthCm: 25, heightCm: 2, insuranceCents: 8990 })
  })

  it('usa o envelope até 3 peças e 8 cm', () => {
    const parcel = buildParcel([{ kind: 'Legging', quantity: 2, price: 12990 }, { kind: 'Blusa', quantity: 1, price: 8990 }])
    expect(parcel.heightCm).toBe(8)
    expect(parcel.weightG).toBe(250 * 2 + 150 + PACKAGING.envelope.weightG)
    expect(parcel.insuranceCents).toBe(12990 * 2 + 8990)
  })

  it('troca para caixa acima do envelope', () => {
    const parcel = buildParcel([{ kind: 'Conjunto', quantity: 2, price: 25990 }])
    expect(parcel.heightCm).toBe(PACKAGING.box.heightCm)
    expect(parcel.weightG).toBe(400 * 2 + PACKAGING.box.weightG)
  })
})

describe('applyRules', () => {
  const raw = [option(2, 3500, 2), option(1, 2000, 7), option(17, 1500, 9), option(3, 2500, 5)]

  it('mostra no máximo 3, da mais barata para a mais cara, com a mais rápida garantida', () => {
    const shown = applyRules(raw, 10000)
    expect(shown.map((o) => o.serviceId)).toEqual([17, 1, 2])
    expect(shown.find((o) => o.cheapest)?.serviceId).toBe(17)
    expect(shown.find((o) => o.fastest)?.serviceId).toBe(2)
  })

  it('soma os dias de manuseio', () => {
    const [first] = applyRules([option(1, 2000, 7)], 10000)
    expect(first.days).toEqual({ min: 1 + HANDLING_DAYS, max: 7 + HANDLING_DAYS })
  })

  it('frete grátis só na mais barata, a partir de R$ 299,00', () => {
    expect(applyRules(raw, 29899).some((o) => o.free)).toBe(false)
    const shown = applyRules(raw, 29900)
    expect(shown[0]).toMatchObject({ serviceId: 17, priceCents: 0, costCents: 1500, free: true })
    expect(shown.filter((o) => o.free)).toHaveLength(1)
  })

  it('sem opções devolve lista vazia', () => {
    expect(applyRules([], 10000)).toEqual([])
  })
})

describe('quoteShipping', () => {
  const items: OrderItem[] = [
    { id: 'legging-brisa', ref: 'X', color: 'Preto', size: 'M', quantity: 1, price: 12990, description: 'Legging' },
  ]

  beforeEach(() => {
    vi.stubEnv('SHIPPING_ORIGIN_CEP', '35500000')
    vi.mocked(melhorEnvio.quote).mockReset()
  })

  it('usa as opções do Melhor Envio quando ele responde (só os serviços aceitos)', async () => {
    vi.mocked(melhorEnvio.quote).mockResolvedValue([option(1, 2000, 7), option(99, 100, 1)])
    const quote = await quoteShipping('30130010', items)
    expect(quote.source).toBe('live')
    expect(quote.options.map((o) => o.serviceId)).toEqual([1])
    expect(quote.options[0].name).toBe('PAC')
  })

  it('cai na contingência da região quando o Melhor Envio falha', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(melhorEnvio.quote).mockRejectedValue(new Error('timeout'))
    const quote = await quoteShipping('69000000', items)
    expect(quote.source).toBe('fallback')
    expect(quote.options).toHaveLength(1)
    expect(quote.options[0].priceCents).toBe(FALLBACK.Norte.priceCents)
  })

  it('cai na contingência quando o Melhor Envio não tem nenhuma opção', async () => {
    vi.mocked(melhorEnvio.quote).mockResolvedValue([])
    expect((await quoteShipping('30130010', items)).source).toBe('fallback')
  })
})
