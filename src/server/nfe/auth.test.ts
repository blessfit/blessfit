import { randomBytes } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { accessToken, connect, isConnected, renewConnection, seal, unseal } from './auth'
import { BlingError, exchangeCode, refreshTokens } from './bling'

type Row = Record<string, string | null | boolean>

/** Banco em memória: só o que `auth.ts` usa de `bling_auth`. */
const store = vi.hoisted(() => ({ row: null as Row | null, lockFree: (() => true) as () => boolean }))

vi.mock('../supabase', () => ({
  db: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: store.row, error: null }) }) }),
      upsert: async (values: Row) => {
        store.row = values
        return { error: null }
      },
      update: (values: Row) => {
        const apply = () => {
          store.row = { ...store.row, ...values }
          return { error: null }
        }
        return {
          eq: () => ({
            or: () => ({
              select: async () => {
                if (!store.lockFree()) return { data: [], error: null }
                apply()
                return { data: [{ id: true }], error: null }
              },
            }),
            then: (resolve: (value: { error: null }) => void) => resolve(apply()),
          }),
        }
      },
    }),
  }),
}))

vi.mock('./bling', () => {
  class BlingError extends Error {
    constructor(
      message: string,
      readonly status?: number,
      readonly type?: string,
    ) {
      super(message)
    }
  }
  return { BlingError, exchangeCode: vi.fn(), refreshTokens: vi.fn() }
})

const fromNow = (ms: number) => new Date(Date.now() + ms).toISOString()
const HOUR = 60 * 60 * 1000
const fresh = { accessToken: 'acesso-novo', refreshToken: 'renovacao-nova', expiresInSeconds: 21600 }

function connected(accessIn = HOUR, refreshIn = 24 * HOUR): Row {
  store.row = {
    id: true,
    access_token: seal('acesso-velho'),
    refresh_token: seal('renovacao-velha'),
    access_expires_at: fromNow(accessIn),
    refresh_expires_at: fromNow(refreshIn),
    refreshing_until: null,
    updated_at: '2026-10-31T00:00:00.000Z',
  }
  return store.row
}

beforeEach(() => {
  vi.stubEnv('BLING_TOKEN_KEY', randomBytes(32).toString('base64'))
  store.row = null
  store.lockFree = () => true
  vi.mocked(refreshTokens).mockReset()
  vi.mocked(exchangeCode).mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('criptografia', () => {
  it('não guarda o token em claro e devolve o original', () => {
    const sealed = seal('segredo')
    expect(sealed).not.toContain('segredo')
    expect(unseal(sealed)).toBe('segredo')
  })

  it('recusa conteúdo adulterado', () => {
    const [iv, tag] = seal('segredo').split('.')
    expect(() => unseal([iv, tag, Buffer.from('outro').toString('base64')].join('.'))).toThrow()
  })

  it('exige chave de 32 bytes', () => {
    vi.stubEnv('BLING_TOKEN_KEY', 'curta')
    expect(() => seal('segredo')).toThrow('BLING_TOKEN_KEY')
  })
})

describe('connect', () => {
  it('grava os tokens criptografados, com 30 dias para o refresh', async () => {
    vi.mocked(exchangeCode).mockResolvedValue(fresh)
    await connect('codigo')

    expect(exchangeCode).toHaveBeenCalledTimes(1)
    expect(store.row?.access_token).not.toContain('acesso-novo')
    expect(store.row?.refresh_token).not.toContain('renovacao-nova')
    expect(unseal(String(store.row?.refresh_token))).toBe('renovacao-nova')
    const days = (Date.parse(String(store.row?.refresh_expires_at)) - Date.now()) / (24 * HOUR)
    expect(Math.round(days)).toBe(30)
  })

  it('não tenta trocar o código de novo se a troca falhar', async () => {
    vi.mocked(exchangeCode).mockRejectedValue(new BlingError('falhou', 500))
    await expect(connect('codigo')).rejects.toThrow('falhou')
    expect(exchangeCode).toHaveBeenCalledTimes(1)
    expect(store.row).toBeNull()
  })
})

describe('accessToken', () => {
  it('sem conexão, pede para reconectar', async () => {
    await expect(accessToken()).rejects.toThrow('Conectar Bling')
    expect(await isConnected()).toBe(false)
  })

  it('usa o token atual enquanto ele estiver longe de expirar', async () => {
    connected()
    await expect(accessToken()).resolves.toBe('acesso-velho')
    expect(refreshTokens).not.toHaveBeenCalled()
  })

  it('renova perto de expirar e grava o par novo, soltando a trava', async () => {
    connected(60_000)
    vi.mocked(refreshTokens).mockResolvedValue(fresh)

    await expect(accessToken()).resolves.toBe('acesso-novo')
    expect(refreshTokens).toHaveBeenCalledWith('renovacao-velha')
    expect(unseal(String(store.row?.refresh_token))).toBe('renovacao-nova')
    expect(store.row?.refreshing_until).toBeNull()
  })

  it('com o refresh vencido, pede para reconectar sem chamar o Bling', async () => {
    connected(-HOUR, -1000)
    await expect(accessToken()).rejects.toThrow('Conectar Bling')
    expect(refreshTokens).not.toHaveBeenCalled()
    expect(await isConnected()).toBe(false)
  })

  it('refresh recusado marca a conexão como expirada e solta a trava', async () => {
    connected(60_000)
    vi.mocked(refreshTokens).mockRejectedValue(new BlingError('recusado', 400, 'invalid_grant'))

    await expect(accessToken()).rejects.toThrow('Conectar Bling')
    expect(await isConnected()).toBe(false)
    expect(store.row?.refreshing_until).toBeNull()
  })

  it('falha temporária mantém a conexão e solta a trava', async () => {
    connected(60_000)
    vi.mocked(refreshTokens).mockRejectedValue(new BlingError('fora do ar', 503))

    await expect(accessToken()).rejects.toThrow('fora do ar')
    expect(await isConnected()).toBe(true)
    expect(store.row?.refreshing_until).toBeNull()
  })

  it('duas renovações juntas: quem não pegou a trava espera e usa o token novo, sem gastar o refresh', async () => {
    vi.useFakeTimers()
    connected(60_000)
    store.lockFree = () => false
    const pending = accessToken()

    // a outra requisição conclui a renovação
    await vi.advanceTimersByTimeAsync(0)
    store.row = { ...store.row, access_token: seal('acesso-da-outra'), updated_at: '2026-10-31T00:00:05.000Z' }
    await vi.advanceTimersByTimeAsync(1000)

    await expect(pending).resolves.toBe('acesso-da-outra')
    expect(refreshTokens).not.toHaveBeenCalled()
  })

  it('desiste com mensagem clara se a outra renovação não terminar', async () => {
    vi.useFakeTimers()
    connected(60_000)
    store.lockFree = () => false
    const pending = accessToken()
    const assertion = expect(pending).rejects.toThrow('sendo renovada')
    await vi.advanceTimersByTimeAsync(5000)
    await assertion
    expect(refreshTokens).not.toHaveBeenCalled()
  })
})

describe('renewConnection', () => {
  it('renova mesmo com o access token ainda válido', async () => {
    connected()
    vi.mocked(refreshTokens).mockResolvedValue(fresh)
    await expect(renewConnection()).resolves.toBe('renewed')
    expect(unseal(String(store.row?.access_token))).toBe('acesso-novo')
  })

  it('sem conexão, não chama o Bling', async () => {
    await expect(renewConnection()).resolves.toBe('not-connected')
    expect(refreshTokens).not.toHaveBeenCalled()
  })
})
