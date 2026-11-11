import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authorizeUrl, BlingError, checkInvoiceAccess, emissionEnv, exchangeCode, refreshTokens } from './bling'

const tokens = { access_token: 'acesso', refresh_token: 'renovacao', expires_in: 21600, token_type: 'Bearer' }

const respond = (body: unknown, status = 200) => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  vi.stubEnv('BLING_CLIENT_ID', 'cliente')
  vi.stubEnv('BLING_CLIENT_SECRET', 'segredo')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('emissionEnv', () => {
  it('só aceita test ou production; o resto desliga', () => {
    vi.stubEnv('BLING_EMISSION_ENV', 'test')
    expect(emissionEnv()).toBe('test')
    vi.stubEnv('BLING_EMISSION_ENV', 'production')
    expect(emissionEnv()).toBe('production')
    vi.stubEnv('BLING_EMISSION_ENV', '')
    expect(emissionEnv()).toBeNull()
    vi.stubEnv('BLING_EMISSION_ENV', 'homologacao')
    expect(emissionEnv()).toBeNull()
  })
})

describe('OAuth', () => {
  it('monta a autorização sem segredo, com client_id e state', () => {
    const url = new URL(authorizeUrl('abc'))
    expect(url.origin + url.pathname).toBe('https://www.bling.com.br/Api/v3/oauth/authorize')
    expect(Object.fromEntries(url.searchParams)).toEqual({ response_type: 'code', client_id: 'cliente', state: 'abc' })
  })

  it('troca o código com Basic no header, JWT ligado e credenciais fora do corpo', async () => {
    const fetchMock = respond(tokens)
    await expect(exchangeCode('codigo')).resolves.toEqual({ accessToken: 'acesso', refreshToken: 'renovacao', expiresInSeconds: 21600 })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.bling.com.br/Api/v3/oauth/token')
    expect(init.headers.Authorization).toBe(`Basic ${Buffer.from('cliente:segredo').toString('base64')}`)
    expect(init.headers['enable-jwt']).toBe('1')
    expect(String(init.body)).toBe('grant_type=authorization_code&code=codigo')
  })

  it('renova com o refresh token', async () => {
    const fetchMock = respond(tokens)
    await refreshTokens('antigo')
    expect(String(fetchMock.mock.calls[0][1].body)).toBe('grant_type=refresh_token&refresh_token=antigo')
  })

  it('expõe o tipo do erro para identificar refresh recusado', async () => {
    respond({ error: { type: 'invalid_grant', message: 'invalid_grant', description: 'The authorization code has expired' } }, 400)
    await expect(refreshTokens('antigo')).rejects.toMatchObject({ status: 400, type: 'invalid_grant', message: 'The authorization code has expired' })
  })

  it('recusa resposta sem os tokens', async () => {
    respond({ access_token: 'acesso' })
    await expect(exchangeCode('codigo')).rejects.toBeInstanceOf(BlingError)
  })
})

describe('API', () => {
  it('envia o Bearer e o header do JWT', async () => {
    const fetchMock = respond({ data: [] })
    await checkInvoiceAccess('token')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.bling.com.br/Api/v3/nfe?limite=1')
    expect(init.headers.Authorization).toBe('Bearer token')
    expect(init.headers['enable-jwt']).toBe('1')
  })

  it.each([
    [401, 'reconecte'],
    [403, 'escopos e o plano'],
    [429, 'Limite de requisições'],
  ])('traduz o HTTP %i', async (status, text) => {
    respond({ error: { type: 'x', message: 'x', description: 'x' } }, status)
    await expect(checkInvoiceAccess('token')).rejects.toMatchObject({ status, message: expect.stringContaining(text) })
  })

  it('junta a descrição e os campos recusados, sem HTML', async () => {
    respond(
      {
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Não foi possível salvar',
          description: 'A nota <b>não</b> pode ser salva',
          fields: [{ code: 1, msg: 'Parcelas com erro', collection: [{ index: 1, code: 12, msg: 'Forma de pagamento inválida' }] }],
        },
      },
      400,
    )
    await expect(checkInvoiceAccess('token')).rejects.toThrow('A nota não pode ser salva · Parcelas com erro · Forma de pagamento inválida')
  })

  it('não quebra com corpo de erro que não é JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>erro</html>', { status: 502 })))
    await expect(checkInvoiceAccess('token')).rejects.toMatchObject({ status: 502, message: 'Resposta inesperada do Bling' })
  })
})
