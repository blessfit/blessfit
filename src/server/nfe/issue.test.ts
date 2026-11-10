import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findOrder, type Order } from '../orders'
import * as bling from './bling'
import { issueInvoice, refreshInvoice, releaseInvoice } from './issue'

const db = vi.hoisted(() => ({ updates: [] as Record<string, unknown>[], lockRows: [{ id: 'pedido' }] as unknown[] }))

vi.mock('../orders', () => ({ findOrder: vi.fn() }))
vi.mock('./auth', () => ({ accessToken: vi.fn(async () => 'token') }))
vi.mock('./invoice', () => ({ invoiceConfig: vi.fn(), buildInvoice: vi.fn(() => ({ ok: true, draft: { rascunho: true } })) }))
vi.mock('./bling', async (importActual) => ({
  ...(await importActual<typeof bling>()),
  createInvoice: vi.fn(),
  updateInvoice: vi.fn(),
  sendInvoice: vi.fn(),
  getInvoice: vi.fn(),
  invoiceEnvironment: vi.fn(),
}))
vi.mock('../supabase', () => ({
  db: () => ({
    from: () => ({
      update: (patch: Record<string, unknown>) => {
        db.updates.push(patch)
        const chain = {
          eq: () => chain,
          is: () => chain,
          or: () => chain,
          lt: () => chain,
          select: async () => ({ data: db.lockRows, error: null }),
          then: (resolve: (value: { error: null }) => void) => resolve({ error: null }),
        }
        return chain
      },
    }),
  }),
}))

const KEY = '31261069633993000135550010000000011747578935'
const PROBE = '27274757893'

const order = (patch: Partial<Order> = {}) => ({ id: 'pedido', status: 'paid', nfe_key: null, nfe_status: null, bling_nfe_id: null, ...patch }) as Order
const nfe = (patch: Partial<bling.Invoice> = {}): bling.Invoice => ({ id: '111', state: 'processing', ...patch })
const authorized = nfe({ state: 'authorized', key: KEY, xmlUrl: 'https://www.bling.com.br/relatorios/nfe.xml.php?x=1', danfeUrl: 'https://www.bling.com.br/doc.view.php?id=1' })

/** getInvoice: a sonda sempre existe; a nota do pedido vem de `byId`. */
const invoices = (byId: Record<string, bling.Invoice | null>) =>
  vi.mocked(bling.getInvoice).mockImplementation(async (_, id) => (id === PROBE ? nfe({ id: PROBE, state: 'authorized' }) : (byId[id] ?? null)))

const last = () => db.updates.at(-1)

beforeEach(() => {
  vi.clearAllMocks()
  db.updates.length = 0
  db.lockRows = [{ id: 'pedido' }]
  vi.stubEnv('BLING_EMISSION_ENV', 'test')
  vi.stubEnv('MELHOR_ENVIO_ENV', 'sandbox')
  vi.stubEnv('BLING_ENV_PROBE_NFE_ID', PROBE)
  vi.mocked(findOrder).mockResolvedValue(order())
  vi.mocked(bling.createInvoice).mockResolvedValue('111')
  vi.mocked(bling.updateInvoice).mockResolvedValue(undefined)
  vi.mocked(bling.sendInvoice).mockResolvedValue(undefined)
  vi.mocked(bling.invoiceEnvironment).mockResolvedValue('test')
})

describe('proteção de ambiente', () => {
  it.each([
    ['emissão desligada', { BLING_EMISSION_ENV: '' }, /desligada/],
    ['Bling em teste e Melhor Envio em produção', { MELHOR_ENVIO_ENV: 'production' }, /Melhor Envio em produção/],
    ['Bling em produção e Melhor Envio em teste', { BLING_EMISSION_ENV: 'production' }, /Melhor Envio em teste/],
    ['sem nota de referência', { BLING_ENV_PROBE_NFE_ID: '' }, /BLING_ENV_PROBE_NFE_ID/],
  ])('recusa com %s, sem chamar o Bling', async (_, env, error) => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
    expect(await issueInvoice('pedido')).toEqual({ ok: false, error: expect.stringMatching(error) })
    expect(bling.getInvoice).not.toHaveBeenCalled()
    expect(db.updates).toEqual([])
  })

  it('sonda sem a nota de referência: não cria e destrava', async () => {
    vi.mocked(bling.getInvoice).mockResolvedValue(null)
    expect(await issueInvoice('pedido')).toEqual({ ok: false, error: expect.stringMatching(/referência/) })
    expect(bling.createInvoice).not.toHaveBeenCalled()
    expect(last()).toMatchObject({ nfe_status: null })
  })

  it('XML de outro ambiente: bloqueia e não grava a chave', async () => {
    invoices({ '111': authorized })
    vi.mocked(bling.invoiceEnvironment).mockResolvedValue('production')
    expect(await issueInvoice('pedido')).toEqual({ ok: false, error: expect.stringMatching(/produção/) })
    expect(last()).toMatchObject({ nfe_status: 'blocked' })
    expect(db.updates.some((u) => 'nfe_key' in u)).toBe(false)
  })

  it('XML ilegível: fica em andamento para conferir depois', async () => {
    invoices({ '111': authorized })
    vi.mocked(bling.invoiceEnvironment).mockResolvedValue(null)
    await issueInvoice('pedido')
    expect(last()).toMatchObject({ nfe_status: 'processing' })
    expect(db.updates.some((u) => 'nfe_key' in u)).toBe(false)
  })
})

describe('issueInvoice', () => {
  it('cria, grava o id, envia sem e-mail e grava a chave autorizada', async () => {
    invoices({ '111': authorized })
    expect(await issueInvoice('pedido')).toEqual({ ok: true, status: 'authorized' })
    expect(db.updates[0]).toMatchObject({ nfe_status: 'issuing' })
    expect(db.updates).toContainEqual(expect.objectContaining({ bling_nfe_id: '111' }))
    expect(bling.sendInvoice).toHaveBeenCalledWith('token', '111')
    expect(last()).toMatchObject({ nfe_status: 'authorized', nfe_key: KEY, nfe_danfe_url: authorized.danfeUrl, nfe_error: null })
  })

  it('dois cliques: o segundo não passa da trava', async () => {
    db.lockRows = []
    expect(await issueInvoice('pedido')).toEqual({ ok: false, error: expect.stringMatching(/já está sendo emitida/) })
    expect(bling.createInvoice).not.toHaveBeenCalled()
  })

  it('pedido já em andamento nem tenta a trava', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({ nfe_status: 'processing', bling_nfe_id: '111' }))
    expect((await issueInvoice('pedido')).ok).toBe(false)
    expect(db.updates).toEqual([])
  })

  it('rejeitada com id gravado: atualiza e reenvia a mesma nota', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({ nfe_status: 'rejected', bling_nfe_id: '111' }))
    let sent = false
    vi.mocked(bling.sendInvoice).mockImplementation(async () => void (sent = true))
    vi.mocked(bling.getInvoice).mockImplementation(async (_, id) => (id === PROBE ? nfe() : sent ? authorized : nfe({ state: 'rejected', number: '000002' })))
    expect(await issueInvoice('pedido')).toEqual({ ok: true, status: 'authorized' })
    expect(bling.createInvoice).not.toHaveBeenCalled()
    expect(bling.updateInvoice).toHaveBeenCalledWith('token', '111', '000002', { rascunho: true })
  })

  it('retomada: id gravado e nota já autorizada no Bling, só grava a chave', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({ nfe_status: 'rejected', bling_nfe_id: '111' }))
    invoices({ '111': authorized })
    expect(await issueInvoice('pedido')).toEqual({ ok: true, status: 'authorized' })
    expect(bling.updateInvoice).not.toHaveBeenCalled()
    expect(bling.sendInvoice).not.toHaveBeenCalled()
  })

  it('envio recusado: rejeitada com o motivo do Bling', async () => {
    invoices({ '111': nfe({ state: 'pending' }) })
    vi.mocked(bling.sendInvoice).mockRejectedValue(new bling.BlingError('NCM inválido', 400))
    expect(await issueInvoice('pedido')).toEqual({ ok: false, error: 'NCM inválido' })
    expect(last()).toMatchObject({ nfe_status: 'rejected', nfe_error: 'NCM inválido' })
  })

  it('Sefaz sem resposta: fica em andamento', async () => {
    invoices({ '111': nfe({ state: 'processing' }) })
    expect(await issueInvoice('pedido')).toEqual({ ok: true, status: 'processing' })
    expect(last()).toMatchObject({ nfe_status: 'processing' })
  })

  it('queda depois de criar: fica em andamento, sem destravar', async () => {
    vi.mocked(bling.getInvoice).mockImplementation(async (_, id) => (id === PROBE ? nfe() : null))
    vi.mocked(bling.sendInvoice).mockRejectedValue(new bling.BlingError('timeout'))
    expect((await issueInvoice('pedido')).ok).toBe(false)
    expect(last()).toMatchObject({ nfe_status: 'processing' })
  })

  it('criação sem resposta: não destrava nem cria outra', async () => {
    invoices({})
    vi.mocked(bling.createInvoice).mockRejectedValue(new bling.BlingError('timeout'))
    expect(await issueInvoice('pedido')).toEqual({ ok: false, error: expect.stringMatching(/Confira/) })
    expect(last()).not.toHaveProperty('nfe_status')
    expect(bling.sendInvoice).not.toHaveBeenCalled()
  })

  it('criação recusada pelo Bling: destrava com o motivo', async () => {
    invoices({})
    vi.mocked(bling.createInvoice).mockRejectedValue(new bling.BlingError('Contato inválido', 400))
    expect(await issueInvoice('pedido')).toEqual({ ok: false, error: 'Contato inválido' })
    expect(last()).toMatchObject({ nfe_status: null, nfe_error: 'Contato inválido' })
  })

  it('autorizada sem chave válida: bloqueia', async () => {
    invoices({ '111': { ...authorized, key: '123' } })
    expect((await issueInvoice('pedido')).ok).toBe(false)
    expect(last()).toMatchObject({ nfe_status: 'blocked' })
  })
})

describe('refreshInvoice', () => {
  it('consulta a nota em andamento e grava a chave, sem criar nem enviar', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({ nfe_status: 'processing', bling_nfe_id: '111' }))
    invoices({ '111': authorized })
    expect(await refreshInvoice('pedido')).toEqual({ ok: true, status: 'authorized' })
    expect(bling.createInvoice).not.toHaveBeenCalled()
    expect(bling.sendInvoice).not.toHaveBeenCalled()
  })

  it('nota sumida (virada de ambiente): avisa e não mexe no pedido', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({ nfe_status: 'processing', bling_nfe_id: '111' }))
    invoices({})
    expect(await refreshInvoice('pedido')).toEqual({ ok: false, error: expect.stringMatching(/ambiente atual/) })
    expect(db.updates).toEqual([])
  })

  it('sem id gravado: orienta a conferir no Bling', async () => {
    vi.mocked(findOrder).mockResolvedValue(order({ nfe_status: 'issuing' }))
    expect(await refreshInvoice('pedido')).toEqual({ ok: false, error: expect.stringMatching(/liberar/) })
  })
})

describe('releaseInvoice', () => {
  it('só libera emissão travada há mais de 2 minutos', async () => {
    db.lockRows = []
    expect((await releaseInvoice('pedido')).ok).toBe(false)
    db.lockRows = [{ id: 'pedido' }]
    expect(await releaseInvoice('pedido')).toEqual({ ok: true })
    expect(last()).toMatchObject({ nfe_status: null })
  })
})
