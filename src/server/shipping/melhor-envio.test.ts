import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generate, quote, removeFromCart } from './melhor-envio'

const parcel = { weightG: 300, lengthCm: 30, widthCm: 25, heightCm: 2, insuranceCents: 8990 }
const pac = { id: 1, name: 'PAC', price: '20.50', delivery_range: { min: 3, max: 7 }, company: { name: 'Correios' } }

const respond = (body: unknown) => vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body))))

describe('quote', () => {
  beforeEach(() => {
    vi.stubEnv('MELHOR_ENVIO_TOKEN', 'token')
    vi.stubEnv('MELHOR_ENVIO_USER_AGENT', 'BlessFit (teste)')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('lê a lista de serviços e descarta os que vêm com erro', async () => {
    respond([pac, { id: 2, name: 'SEDEX', error: 'Fora do limite' }])
    const options = await quote({ from: '35500000', to: '30130010', parcel, services: [1, 2] })
    expect(options).toEqual([{ serviceId: 1, name: 'PAC', carrier: 'Correios', costCents: 2050, days: { min: 3, max: 7 } }])
  })

  it('aceita o objeto único que o ME devolve quando a cotação é de um serviço só', async () => {
    respond(pac)
    const options = await quote({ from: '35500000', to: '30130010', parcel, services: [1] })
    expect(options).toHaveLength(1)
    expect(options[0].costCents).toBe(2050)
  })

  it('generate aceita a geração pedida', async () => {
    respond({ envio: { status: true, message: 'Envio gerado com sucesso' } })
    await expect(generate('envio')).resolves.toBeUndefined()
  })

  it('generate falha quando o ME recusa com HTTP 200 e status false', async () => {
    respond({ envio: { status: false, message: 'Não foi possível gerar' } })
    await expect(generate('envio')).rejects.toThrow('Não foi possível gerar')
  })

  it('removeFromCart aceita a resposta 204, sem corpo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    await expect(removeFromCart('envio')).resolves.toBeUndefined()
  })
})
