/*
 * Cliente da API v3 do Bling (OAuth e NF-e). Referência em docs/spec-nfe-bling.md.
 *
 * Nenhum tipo do Bling sai deste arquivo. As rotas recebem o access token de quem chama: quem guarda e renova
 * os tokens é o ./auth.
 */
import 'server-only'
import type { InvoiceDraft } from './invoice'

const API = 'https://api.bling.com.br/Api/v3'
const AUTHORIZE = 'https://www.bling.com.br/Api/v3/oauth/authorize'
const TIMEOUT_MS = 15_000
/** O Bling aceita 3 requisições por segundo por conta. */
const MIN_INTERVAL_MS = 350

export class BlingError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    /** Tipo informado pelo Bling, ex.: invalid_grant. */
    readonly type?: string,
  ) {
    super(message)
  }
}

export type TokenSet = { accessToken: string; refreshToken: string; expiresInSeconds: number }

/**
 * Ambiente fiscal em que este site pode emitir. Sem a variável, a integração fica desligada.
 * O Bling não informa o ambiente da conta (spec §3): este valor é só o que o site espera encontrar.
 */
export function emissionEnv(): 'test' | 'production' | null {
  const env = process.env.BLING_EMISSION_ENV
  return env === 'test' || env === 'production' ? env : null
}

function credentials() {
  const id = process.env.BLING_CLIENT_ID
  const secret = process.env.BLING_CLIENT_SECRET
  if (!id || !secret) throw new BlingError('BLING_CLIENT_ID / BLING_CLIENT_SECRET não configurados')
  return { id, secret }
}

let queue: Promise<unknown> = Promise.resolve()

/** Espaça as chamadas desta instância para respeitar o limite por segundo. */
function throttled<T>(call: () => Promise<T>): Promise<T> {
  const run = queue.then(call, call)
  queue = run.then(
    () => new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS)),
    () => new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS)),
  )
  return run
}

type ErrorField = { msg?: string; collection?: ErrorField[] }
type ErrorBody = {
  error?: string | { type?: string; message?: string; description?: string; fields?: ErrorField[] }
  error_description?: string
}

const plain = (text: string) => text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

/** Mensagem legível do corpo de erro, sem HTML. Traz os campos recusados, quando houver. */
function parseError(text: string): { message: string; type?: string } {
  try {
    const { error, error_description: oauthDescription } = JSON.parse(text) as ErrorBody
    if (typeof error === 'string') return { message: plain(oauthDescription ?? error), type: error }
    const fields = (error?.fields ?? []).flatMap((f) => [f.msg, ...(f.collection ?? []).map((c) => c.msg)]).filter(Boolean)
    const message = plain([error?.description ?? error?.message, ...fields].filter(Boolean).join(' · '))
    return { message: message.slice(0, 500) || 'Erro sem detalhes no Bling', type: error?.type }
  } catch {
    return { message: 'Resposta inesperada do Bling' }
  }
}

/** Endereço para onde o admin vai autorizar. O retorno e os escopos vêm do cadastro do aplicativo no Bling. */
export function authorizeUrl(state: string): string {
  const query = new URLSearchParams({ response_type: 'code', client_id: credentials().id, state })
  return `${AUTHORIZE}?${query}`
}

async function requestTokens(params: Record<string, string>): Promise<TokenSet> {
  const { id, secret } = credentials()
  const res = await throttled(() =>
    fetch(`${API}/oauth/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '1.0',
        'enable-jwt': '1',
      },
      body: new URLSearchParams(params),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    }),
  )
  const text = await res.text()
  if (!res.ok) {
    const { message, type } = parseError(text)
    throw new BlingError(message, res.status, type)
  }
  let body: { access_token?: string; refresh_token?: string; expires_in?: number }
  try {
    body = JSON.parse(text)
  } catch {
    throw new BlingError('Resposta inesperada do Bling ao obter os tokens', res.status)
  }
  if (!body.access_token || !body.refresh_token || !body.expires_in) {
    throw new BlingError('O Bling não devolveu os tokens esperados', res.status)
  }
  return { accessToken: body.access_token, refreshToken: body.refresh_token, expiresInSeconds: body.expires_in }
}

/**
 * Troca o código de autorização pelos tokens. Chamar uma vez só por código: reutilizar um código ainda válido
 * faz o Bling revogar o usuário.
 */
export const exchangeCode = (code: string) => requestTokens({ grant_type: 'authorization_code', code })

export const refreshTokens = (refreshToken: string) => requestTokens({ grant_type: 'refresh_token', refresh_token: refreshToken })

async function request<T>(accessToken: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: object): Promise<T> {
  const res = await throttled(() =>
    fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'enable-jwt': '1',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    }),
  )
  const text = await res.text()
  if (res.status === 401) throw new BlingError('Conexão com o Bling expirada ou inválida: reconecte', 401)
  if (res.status === 403) throw new BlingError('O aplicativo do Bling não tem permissão para esta operação: confira os escopos e o plano', 403)
  if (res.status === 429) throw new BlingError('Limite de requisições do Bling atingido: tente de novo em instantes', 429)
  if (!res.ok) {
    const { message, type } = parseError(text)
    throw new BlingError(message, res.status, type)
  }
  try {
    return (text ? JSON.parse(text) : undefined) as T
  } catch {
    throw new BlingError('Resposta inesperada do Bling', res.status)
  }
}

const reais = (cents: number) => cents / 100

/**
 * Corpo de `POST /nfe` a partir do rascunho (spec §8). Campos omitidos de propósito:
 * - `numero`: obrigatório no schema, mas sem rota de "próximo número". 🧪 Testar se o Bling numera sozinho.
 * - `itens[].cfop`, presença, intermediador e consumidor final: vêm da natureza de operação.
 */
export function nfeBody(draft: InvoiceDraft) {
  const { customer, payment } = draft
  return {
    tipo: 1,
    finalidade: 1,
    dataOperacao: draft.issuedAt,
    dataEmissao: draft.issuedAt,
    naturezaOperacao: { id: draft.natureId },
    contato: {
      nome: customer.name,
      tipoPessoa: 'F',
      numeroDocumento: customer.cpf,
      contribuinte: 9,
      ...(customer.email && { email: customer.email }),
      ...(customer.phone && { telefone: customer.phone }),
      endereco: {
        endereco: customer.address.street,
        numero: customer.address.number,
        ...(customer.address.complement && { complemento: customer.address.complement }),
        bairro: customer.address.district,
        cep: customer.address.cep,
        municipio: customer.address.city,
        uf: customer.address.uf,
      },
    },
    itens: draft.items.map((item) => ({
      codigo: item.code,
      descricao: item.description,
      unidade: 'UN',
      quantidade: item.quantity,
      valor: reais(item.unitCents),
      tipo: 'P',
      classificacaoFiscal: item.ncm,
      origem: item.origin,
      pesoBruto: item.weightKg,
      pesoLiquido: item.weightKg,
    })),
    // 🧪 o schema não diz se é valor ou percentual: conferir no XML do primeiro teste com cupom
    ...(draft.discountCents > 0 && { desconto: reais(draft.discountCents) }),
    transporte: {
      fretePorConta: 0,
      frete: reais(draft.shippingCents),
      transportador: { nome: draft.carrier },
      volume: { quantidade: 1, especie: 2, pesoBruto: draft.volume.grossKg, pesoLiquido: draft.volume.netKg },
    },
    parcelas: [{ data: payment.date, valor: reais(payment.amountCents), formaPagamento: { id: payment.methodId } }],
  }
}

/** Confere o acesso às rotas de NF-e. Um `403` indica escopo faltando ou plano sem a rota. */
export async function checkInvoiceAccess(accessToken: string): Promise<void> {
  await request<unknown>(accessToken, 'GET', '/nfe?limite=1')
}

/** Situação da nota no Bling (`situacao`), já no vocabulário do site. Tabela na spec §9. */
export type InvoiceState = 'pending' | 'processing' | 'rejected' | 'authorized' | 'blocked'

export type Invoice = {
  id: string
  state: InvoiceState
  number?: string
  /** Só vem preenchida depois de autorizada. */
  key?: string
  /** Traz `accessKey`, que dá acesso ao documento: só para o painel, nunca para log. */
  danfeUrl?: string
  /** Link assinado do XML, usado para conferir o ambiente (`tpAmb`). */
  xmlUrl?: string
}

export function invoiceState(situacao: number | undefined): InvoiceState {
  switch (situacao) {
    case 1:
      return 'pending'
    case 4:
      return 'rejected'
    case 5:
    case 6:
      return 'authorized'
    case 2:
    case 9:
    case 11:
      return 'blocked'
    default:
      // 3, 8 e 10 aguardam a Sefaz; 7 (Registrada) e qualquer valor novo ficam em andamento até saber mais
      return 'processing'
  }
}

/** Id do Bling na URL: só dígitos, para nenhum valor do banco mudar a rota chamada. */
const idPath = (id: string) => {
  if (!/^\d{1,20}$/.test(id)) throw new BlingError('Id de nota do Bling inválido')
  return id
}

/** Cria a nota (ainda não enviada à Sefaz) e devolve o id. */
export async function createInvoice(accessToken: string, draft: InvoiceDraft): Promise<string> {
  const res = await request<{ data?: { id?: number } }>(accessToken, 'POST', '/nfe', nfeBody(draft))
  if (!res?.data?.id) throw new BlingError('O Bling não devolveu o id da nota criada')
  return String(res.data.id)
}

/**
 * Atualiza uma nota ainda não autorizada (retentativa depois de rejeição). Testado em 10/11/2026: o `PUT` exige o
 * `numero` que o Bling deu à nota (sem ele, 400) e aceita corrigir nota rejeitada.
 */
export async function updateInvoice(accessToken: string, id: string, number: string, draft: InvoiceDraft): Promise<void> {
  await request<unknown>(accessToken, 'PUT', `/nfe/${idPath(id)}`, { ...nfeBody(draft), numero: number })
}

/** Envia a nota à Sefaz, sem o e-mail automático do Bling. O `200` não traz a situação: consultar depois. */
export async function sendInvoice(accessToken: string, id: string): Promise<void> {
  await request<unknown>(accessToken, 'POST', `/nfe/${idPath(id)}/enviar?enviarEmail=false`)
}

/** Nota pelo id, ou null se não existe no ambiente atual da conta (404). */
export async function getInvoice(accessToken: string, id: string): Promise<Invoice | null> {
  type Body = { data?: { id?: number; situacao?: number; numero?: string; chaveAcesso?: string; linkDanfe?: string; xml?: string } }
  let res: Body
  try {
    res = await request<Body>(accessToken, 'GET', `/nfe/${idPath(id)}`)
  } catch (err) {
    if (err instanceof BlingError && err.status === 404) return null
    throw err
  }
  const data = res?.data
  if (!data?.id) throw new BlingError('Resposta inesperada do Bling ao consultar a nota')
  return {
    id: String(data.id),
    state: invoiceState(data.situacao),
    number: data.numero || undefined,
    key: data.chaveAcesso || undefined,
    danfeUrl: data.linkDanfe || undefined,
    xmlUrl: data.xml || undefined,
  }
}

const BLING_HOST = 'www.bling.com.br'

/**
 * Ambiente em que a Sefaz autorizou a nota, lido do `tpAmb` do XML (`1` produção, `2` homologação).
 * Null quando não dá para ler: quem chama trata como divergência.
 */
export async function invoiceEnvironment(xmlUrl: string): Promise<'test' | 'production' | null> {
  let url: URL
  try {
    url = new URL(xmlUrl)
  } catch {
    return null
  }
  // o link vem do Bling, mas só segue se apontar para ele
  if (url.protocol !== 'https:' || url.host !== BLING_HOST) return null
  const res = await throttled(() => fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'no-store', redirect: 'error' }))
  if (!res.ok) return null
  const tpAmb = (await res.text()).match(/<tpAmb>\s*([12])\s*<\/tpAmb>/)?.[1]
  return tpAmb === '1' ? 'production' : tpAmb === '2' ? 'test' : null
}
