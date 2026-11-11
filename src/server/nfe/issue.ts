/*
 * Emissão da NF-e pelo painel (docs/spec-nfe-bling.md §3, §4 e §9): criar → enviar à Sefaz → consultar.
 *
 * Regras que este arquivo garante:
 * - Trava em `nfe_status`: dois cliques não criam duas notas.
 * - Com `bling_nfe_id` gravado, a retentativa reaproveita a mesma nota. Nunca cria outra automaticamente.
 * - Antes de criar, a sonda confere se a conta Bling está no ambiente esperado. Depois de autorizada, o `tpAmb`
 *   do XML precisa bater com BLING_EMISSION_ENV, senão a chave não é gravada.
 * - Logs só com id do pedido e status HTTP: nada de CPF, endereço, chave ou link do DANFE.
 */
import 'server-only'
import { digits, isNfeKey } from '@/lib/documents'
import { findOrder, type NfeStatus, type Order } from '../orders'
import { db } from '../supabase'
import { accessToken } from './auth'
import { BlingError, createInvoice, emissionEnv, getInvoice, invoiceEnvironment, sendInvoice, updateInvoice, type Invoice } from './bling'
import { buildInvoice, invoiceConfig } from './invoice'

export type NfeResult = { ok: true; status: NfeStatus } | { ok: false; error: string }

/** Emissão travada em `issuing` sem id há mais que isso pode ser liberada pelo admin (spec §9, queda no meio). */
export const STALE_ISSUING_MS = 2 * 60 * 1000

type Env = 'test' | 'production'

const message = (err: unknown) => (err instanceof Error ? err.message : String(err)).slice(0, 500)
const isClientError = (err: unknown) => err instanceof BlingError && !!err.status && err.status >= 400 && err.status < 500 && err.status !== 429

const ENV_LABEL: Record<Env, string> = { test: 'teste', production: 'produção' }

/** Ambiente da emissão e as proteções da spec §3, antes de qualquer chamada ao Bling. */
function guard(): { ok: true; env: Env; probeId: string } | { ok: false; error: string } {
  const env = emissionEnv()
  if (!env) return { ok: false, error: 'A emissão de NF-e está desligada neste ambiente' }
  const shipping: Env = process.env.MELHOR_ENVIO_ENV === 'production' ? 'production' : 'test'
  if (shipping !== env) {
    return { ok: false, error: `Bling em ${ENV_LABEL[env]} e Melhor Envio em ${ENV_LABEL[shipping]}: emissão bloqueada` }
  }
  const probeId = process.env.BLING_ENV_PROBE_NFE_ID?.trim()
  if (!probeId) return { ok: false, error: 'Configure BLING_ENV_PROBE_NFE_ID (nota de referência do ambiente) antes de emitir' }
  return { ok: true, env, probeId }
}

async function save(orderId: string, patch: Partial<Order>) {
  const { error } = await db()
    .from('orders')
    .update({ ...patch, nfe_updated_at: new Date().toISOString() })
    .eq('id', orderId)
  if (error) throw error
}

/** Sonda: a nota de referência só existe no ambiente esperado. Outro ambiente devolve 404. */
async function probe(token: string, probeId: string, env: Env) {
  if (!(await getInvoice(token, probeId))) {
    throw new BlingError(`A nota de referência não existe na conta Bling: a conta pode não estar em ${ENV_LABEL[env]}. Emissão bloqueada`)
  }
}

/** Grava o que a consulta ao Bling mostrou e devolve o resultado para o painel. */
async function settle(orderId: string, nfe: Invoice, env: Env, sendError?: string): Promise<NfeResult> {
  const fail = async (status: NfeStatus, error: string): Promise<NfeResult> => {
    await save(orderId, { nfe_status: status, nfe_error: error })
    return { ok: false, error }
  }

  switch (nfe.state) {
    case 'authorized': {
      const key = digits(nfe.key ?? '')
      if (!isNfeKey(key)) return fail('blocked', 'O Bling marcou a nota como autorizada sem uma chave válida: confira em Notas fiscais')
      const xmlEnv = nfe.xmlUrl ? await invoiceEnvironment(nfe.xmlUrl).catch(() => null) : null
      if (!xmlEnv) return fail('processing', 'Nota autorizada, mas não deu para conferir o ambiente no XML: clique em Atualizar')
      if (xmlEnv !== env) {
        console.error(`[nfe] pedido ${orderId}: nota autorizada em ambiente divergente`)
        return fail(
          'blocked',
          `A nota foi autorizada em ${ENV_LABEL[xmlEnv]}, mas este site emite em ${ENV_LABEL[env]}. A chave não foi gravada: resolva no Bling`,
        )
      }
      await save(orderId, { nfe_status: 'authorized', nfe_key: key, nfe_danfe_url: nfe.danfeUrl ?? null, nfe_error: null })
      return { ok: true, status: 'authorized' }
    }
    case 'rejected':
      return fail('rejected', sendError ?? 'A Sefaz rejeitou a nota: veja o motivo em Bling > Notas fiscais, corrija e tente de novo')
    case 'pending':
      // ainda não foi enviada: a retentativa atualiza e envia a mesma nota
      return fail('rejected', sendError ?? 'A nota foi criada no Bling, mas não foi enviada à Sefaz: tente de novo')
    case 'blocked':
      return fail('blocked', 'A nota está cancelada, denegada ou bloqueada no Bling: resolva por lá')
    case 'processing':
      await save(orderId, { nfe_status: 'processing', nfe_error: null })
      return { ok: true, status: 'processing' }
  }
}

/** Botão "Emitir NF-e" (e "Tentar de novo" depois de rejeição). */
export async function issueInvoice(orderId: string): Promise<NfeResult> {
  const env = guard()
  if (!env.ok) return env

  const order = await findOrder(orderId)
  if (!order) return { ok: false, error: 'Pedido não encontrado' }
  if (order.nfe_status && order.nfe_status !== 'rejected') return { ok: false, error: 'A nota já está sendo emitida ou já foi emitida' }
  const built = buildInvoice(order, invoiceConfig(env.env), new Date())
  if (!built.ok) return built

  // trava: só sai de nulo ou rejeitada, e nunca por cima de chave colada à mão
  const { data: locked, error } = await db()
    .from('orders')
    .update({ nfe_status: 'issuing', nfe_error: null, nfe_updated_at: new Date().toISOString() })
    .eq('id', order.id)
    .is('nfe_key', null)
    .or('nfe_status.is.null,nfe_status.eq.rejected')
    .select('id')
  if (error) throw error
  if (!locked?.length) return { ok: false, error: 'A nota já está sendo emitida ou já foi emitida' }

  const previous = order.nfe_status
  const giveUp = async (err: unknown): Promise<NfeResult> => {
    await save(order.id, { nfe_status: previous, nfe_error: message(err) })
    return { ok: false, error: message(err) }
  }

  let token: string
  try {
    token = await accessToken()
    await probe(token, env.probeId, env.env)
  } catch (err) {
    return giveUp(err)
  }

  let id = order.bling_nfe_id
  try {
    if (id) {
      const current = await getInvoice(token, id)
      if (!current) return giveUp(new BlingError('A nota deste pedido não foi encontrada no Bling: confira em Notas fiscais'))
      if (current.state !== 'rejected' && current.state !== 'pending') return await settle(order.id, current, env.env)
      if (!current.number) return giveUp(new BlingError('O Bling não informou o número da nota: corrija e envie por Bling > Notas fiscais'))
      try {
        await updateInvoice(token, id, current.number, built.draft)
      } catch (err) {
        // correção recusada: a nota segue rejeitada no Bling, com o motivo e o "Tentar de novo"
        if (!isClientError(err)) throw err
        await save(order.id, { nfe_status: 'rejected', nfe_error: message(err) })
        return { ok: false, error: message(err) }
      }
    } else {
      try {
        id = await createInvoice(token, built.draft)
      } catch (err) {
        // recusa do Bling = a nota não foi criada. Sem resposta, não dá para saber: não tentar de novo sozinho
        if (isClientError(err)) return giveUp(err)
        console.error(`[nfe] pedido ${order.id}: criação sem confirmação (HTTP ${err instanceof BlingError ? (err.status ?? '-') : '-'})`)
        const error = 'Não deu para confirmar se o Bling criou a nota. Confira em Bling > Notas fiscais antes de tentar de novo'
        await save(order.id, { nfe_error: error })
        return { ok: false, error }
      }
      await save(order.id, { bling_nfe_id: id })
    }

    let sendError: string | undefined
    try {
      await sendInvoice(token, id)
    } catch (err) {
      // erro de validação ou rejeição vem como 4xx com o motivo; o resto (queda, 5xx) pode ter sido enviado
      if (!isClientError(err)) throw err
      sendError = message(err)
    }

    const nfe = await getInvoice(token, id)
    if (!nfe) throw new BlingError('A nota sumiu do Bling logo depois de enviada: confira em Notas fiscais')
    return await settle(order.id, nfe, env.env, sendError)
  } catch (err) {
    console.error(`[nfe] pedido ${order.id}: falha na emissão (HTTP ${err instanceof BlingError ? (err.status ?? '-') : '-'})`)
    if (!id) return giveUp(err)
    // a nota existe: fica em andamento e o Atualizar consulta, sem criar outra
    const error = `${message(err)}. Clique em Atualizar para consultar a nota no Bling`
    await save(order.id, { nfe_status: 'processing', nfe_error: error })
    return { ok: false, error }
  }
}

/** Botão "Atualizar": só consulta a nota já criada. Nunca cria nem envia. */
export async function refreshInvoice(orderId: string): Promise<NfeResult> {
  const env = guard()
  if (!env.ok) return env

  const order = await findOrder(orderId)
  if (!order) return { ok: false, error: 'Pedido não encontrado' }
  if (order.nfe_status !== 'issuing' && order.nfe_status !== 'processing') return { ok: false, error: 'Não há nota em andamento neste pedido' }
  if (!order.bling_nfe_id) {
    return { ok: false, error: 'A nota ainda não foi criada no Bling. Se a emissão travou, confira em Bling > Notas fiscais antes de liberar' }
  }

  try {
    const nfe = await getInvoice(await accessToken(), order.bling_nfe_id)
    // depois de uma virada de ambiente, a nota antiga some: avisa e não mexe em nada
    if (!nfe) return { ok: false, error: 'A nota não foi encontrada no ambiente atual da conta Bling: confira em Notas fiscais' }
    return await settle(order.id, nfe, env.env)
  } catch (err) {
    return { ok: false, error: message(err) }
  }
}

/** O painel mostra "Liberar nova emissão": travada sem id há mais de 2 minutos. Mesma regra de releaseInvoice. */
export function canRelease(order: Pick<Order, 'nfe_status' | 'bling_nfe_id' | 'nfe_updated_at'>, now = Date.now()): boolean {
  return (
    order.nfe_status === 'issuing' &&
    !order.bling_nfe_id &&
    !!order.nfe_updated_at &&
    Date.parse(order.nfe_updated_at) < now - STALE_ISSUING_MS
  )
}

/**
 * Libera uma emissão que travou antes de o Bling devolver o id (queda no meio). O admin confirma antes que não
 * há nota deste pedido no Bling: o site não consegue saber sozinho (spec §9).
 */
export async function releaseInvoice(orderId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) return { ok: false, error: 'Pedido não encontrado' }
  const staleBefore = new Date(Date.now() - STALE_ISSUING_MS).toISOString()
  const { data, error } = await db()
    .from('orders')
    .update({ nfe_status: null, nfe_error: null, nfe_updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('nfe_status', 'issuing')
    .is('bling_nfe_id', null)
    .lt('nfe_updated_at', staleBefore)
    .select('id')
  if (error) throw error
  if (!data?.length) return { ok: false, error: 'Só dá para liberar uma emissão travada há mais de 2 minutos, antes de a nota ser criada' }
  return { ok: true }
}
