import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findOrder, type Order } from '../orders'
import { generateLabel } from './label'
import * as melhorEnvio from './melhor-envio'

const updates = vi.hoisted(() => [] as Record<string, unknown>[])

vi.mock('server-only', () => ({}))
vi.mock('../orders', () => ({ findOrder: vi.fn() }))
vi.mock('./quote', () => ({ originCep: () => '35500163' }))
vi.mock('./melhor-envio', () => {
  class MelhorEnvioError extends Error {
    constructor(
      message: string,
      readonly status?: number,
    ) {
      super(message)
    }
  }
  return { MelhorEnvioError, quote: vi.fn(), addToCart: vi.fn(), getOrder: vi.fn(), removeFromCart: vi.fn(), checkout: vi.fn(), generate: vi.fn() }
})
vi.mock('../supabase', () => ({
  db: () => ({
    from: () => ({
      update: (patch: Record<string, unknown>) => {
        updates.push(patch)
        return {
          eq: () => ({
            or: () => ({ select: async () => ({ data: [{ id: 'pedido' }], error: null }) }),
            then: (resolve: (value: { error: null }) => void) => resolve({ error: null }),
          }),
        }
      },
    }),
  }),
}))

const OLD_KEY = '31261069633993000135559990000000011123456783'
const NEW_KEY = '31261069633993000135550010000000011747578935'

const order = (patch: Partial<Order>) =>
  ({
    id: 'pedido',
    status: 'paid',
    items: [{ description: 'Conjunto', quantity: 1, price: 100 }],
    customer: { name: 'Cliente', phone_number: '+5537999999999', email: 'c@example.com' },
    customer_cpf: '09926651674',
    shipping: { serviceId: 1, name: 'SEDEX', carrier: 'Correios', costCents: 1000, parcel: {} },
    shipping_address: { cep: '31320455' },
    nfe_key: OLD_KEY,
    me_order_id: 'envio-antigo',
    shipping_status: 'failed',
    ...patch,
  }) as Order

const meOrder = (patch: Partial<melhorEnvio.MeOrder>): melhorEnvio.MeOrder => ({
  id: 'envio-novo',
  status: 'pending',
  paidAt: '2026-10-31',
  generatedAt: '2026-10-31',
  tracking: 'AA123',
  costCents: 1000,
  ...patch,
})

describe('generateLabel com envio já no carrinho', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updates.length = 0
    for (const key of ['NAME', 'CNPJ', 'PHONE', 'EMAIL', 'STREET', 'NUMBER', 'DISTRICT', 'CITY', 'UF']) {
      vi.stubEnv(`SHIPPING_SENDER_${key}`, 'x')
    }
    vi.mocked(melhorEnvio.quote).mockResolvedValue([{ serviceId: 1, name: 'SEDEX', carrier: 'Correios', costCents: 1000, days: { min: 1, max: 2 } }])
    vi.mocked(melhorEnvio.addToCart).mockResolvedValue('envio-novo')
  })

  it('com a mesma chave, retoma o envio sem criar outro', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({}))
    vi.mocked(melhorEnvio.getOrder).mockResolvedValue(meOrder({ id: 'envio-antigo' }))

    expect(await generateLabel('pedido', OLD_KEY)).toEqual({ ok: true })
    expect(melhorEnvio.removeFromCart).not.toHaveBeenCalled()
    expect(melhorEnvio.addToCart).not.toHaveBeenCalled()
  })

  it('com outra chave, tira o envio antigo do carrinho e cria um com a chave nova', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({}))
    vi.mocked(melhorEnvio.getOrder).mockResolvedValueOnce(meOrder({ id: 'envio-antigo', paidAt: null })).mockResolvedValue(meOrder({}))

    expect(await generateLabel('pedido', NEW_KEY)).toEqual({ ok: true })
    expect(melhorEnvio.removeFromCart).toHaveBeenCalledWith('envio-antigo')
    expect(vi.mocked(melhorEnvio.addToCart).mock.calls[0][0].nfeKey).toBe(NEW_KEY)
    expect(updates).toContainEqual({ me_order_id: 'envio-novo' })
    expect(updates).toContainEqual({ nfe_key: NEW_KEY })
  })

  it('com outra chave, recusa se o envio antigo já foi pago e mantém a chave dele', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({}))
    vi.mocked(melhorEnvio.getOrder).mockResolvedValue(meOrder({ id: 'envio-antigo' }))

    const result = await generateLabel('pedido', NEW_KEY)

    expect(result.ok).toBe(false)
    expect(melhorEnvio.removeFromCart).not.toHaveBeenCalled()
    expect(melhorEnvio.checkout).not.toHaveBeenCalled()
    expect(updates).not.toContainEqual({ nfe_key: NEW_KEY })
    expect(updates).not.toContainEqual({ me_order_id: null })
  })

  it('com outra chave, segue se o envio antigo já não existe no Melhor Envio', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({}))
    vi.mocked(melhorEnvio.getOrder).mockRejectedValueOnce(new melhorEnvio.MelhorEnvioError('Registro não encontrado', 404)).mockResolvedValue(meOrder({}))

    expect(await generateLabel('pedido', NEW_KEY)).toEqual({ ok: true })
    expect(melhorEnvio.removeFromCart).not.toHaveBeenCalled()
    expect(vi.mocked(melhorEnvio.addToCart).mock.calls[0][0].nfeKey).toBe(NEW_KEY)
  })
})
