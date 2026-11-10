/*
 * Tokens da conexão com o Bling: linha única em `bling_auth`, criptografada com BLING_TOKEN_KEY.
 *
 * O refresh token permite emitir notas em nome da empresa, por isso nunca sai daqui nem vai para log.
 * A documentação não diz se o refresh token antigo deixa de valer ao renovar: tratamos como se deixasse,
 * gravando sempre o par recebido e renovando dentro de uma trava.
 */
import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { db } from '../supabase'
import { BlingError, exchangeCode, refreshTokens, type TokenSet } from './bling'

const REFRESH_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000
/** Renova um pouco antes de expirar, para o token não vencer no meio de uma emissão. */
const EXPIRY_MARGIN_MS = 5 * 60 * 1000
const LOCK_MS = 30_000
const WAIT_ATTEMPTS = 5
const WAIT_INTERVAL_MS = 1000

export const RECONNECT_MESSAGE = 'A conexão com o Bling expirou: clique em Conectar Bling'

type AuthRow = {
  access_token: string
  refresh_token: string
  access_expires_at: string
  refresh_expires_at: string
  updated_at: string
}

function tokenKey(): Buffer {
  const key = Buffer.from(process.env.BLING_TOKEN_KEY ?? '', 'base64')
  if (key.length !== 32) throw new Error('BLING_TOKEN_KEY precisa ter 32 bytes em base64')
  return key
}

export function seal(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', tokenKey(), iv)
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64')).join('.')
}

export function unseal(sealed: string): string {
  const [iv, tag, data] = sealed.split('.').map((part) => Buffer.from(part, 'base64'))
  const decipher = createDecipheriv('aes-256-gcm', tokenKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}

const fields = (tokens: TokenSet) => {
  const now = Date.now()
  return {
    access_token: seal(tokens.accessToken),
    refresh_token: seal(tokens.refreshToken),
    access_expires_at: new Date(now + tokens.expiresInSeconds * 1000).toISOString(),
    refresh_expires_at: new Date(now + REFRESH_LIFETIME_MS).toISOString(),
    refreshing_until: null,
    updated_at: new Date(now).toISOString(),
  }
}

async function readRow(): Promise<AuthRow | null> {
  const { data, error } = await db().from('bling_auth').select('*').eq('id', true).maybeSingle<AuthRow>()
  if (error) throw error
  return data
}

async function patch(values: Record<string, unknown>) {
  const { error } = await db().from('bling_auth').update(values).eq('id', true)
  if (error) throw error
}

/** Conclui a autorização: troca o código e grava os tokens. O código só pode ser usado uma vez. */
export async function connect(code: string): Promise<void> {
  const tokens = await exchangeCode(code)
  const { error } = await db().from('bling_auth').upsert({ id: true, ...fields(tokens) })
  if (error) throw error
}

export async function isConnected(): Promise<boolean> {
  const row = await readRow()
  return !!row && Date.parse(row.refresh_expires_at) > Date.now()
}

async function takeLock(): Promise<boolean> {
  const now = new Date()
  const { data, error } = await db()
    .from('bling_auth')
    .update({ refreshing_until: new Date(now.getTime() + LOCK_MS).toISOString() })
    .eq('id', true)
    .or(`refreshing_until.is.null,refreshing_until.lt.${now.toISOString()}`)
    .select('id')
  if (error) throw error
  return !!data?.length
}

/** Outra requisição está renovando: espera ela gravar o token novo. */
async function waitForRenewal(before: string): Promise<AuthRow> {
  for (let i = 0; i < WAIT_ATTEMPTS; i++) {
    await new Promise((resolve) => setTimeout(resolve, WAIT_INTERVAL_MS))
    const row = await readRow()
    if (row && row.updated_at !== before) return row
  }
  throw new BlingError('A conexão com o Bling está sendo renovada: tente de novo em instantes')
}

/** Renova os tokens e devolve o access token novo. `seen` é a linha que motivou a renovação. */
async function renew(seen: AuthRow): Promise<string> {
  if (!(await takeLock())) return unseal((await waitForRenewal(seen.updated_at)).access_token)

  try {
    // quem segurava a trava pode ter acabado de renovar: não gastar o refresh token à toa
    const row = await readRow()
    if (!row) throw new BlingError(RECONNECT_MESSAGE)
    if (row.updated_at !== seen.updated_at) {
      await patch({ refreshing_until: null })
      return unseal(row.access_token)
    }
    const tokens = await refreshTokens(unseal(row.refresh_token))
    const values = fields(tokens)
    await patch(values)
    return tokens.accessToken
  } catch (err) {
    // refresh recusado de vez: marca como expirado para o painel pedir a reconexão
    const rejected = err instanceof BlingError && err.type === 'invalid_grant'
    await patch({ refreshing_until: null, ...(rejected ? { refresh_expires_at: new Date().toISOString() } : {}) })
    throw rejected ? new BlingError(RECONNECT_MESSAGE, err.status, err.type) : err
  }
}

/** Access token válido, renovando se estiver perto de expirar. */
export async function accessToken(): Promise<string> {
  const row = await readRow()
  if (!row || Date.parse(row.refresh_expires_at) <= Date.now()) throw new BlingError(RECONNECT_MESSAGE)
  if (Date.parse(row.access_expires_at) - Date.now() > EXPIRY_MARGIN_MS) return unseal(row.access_token)
  return renew(row)
}

/** Renovação do cron: um período sem vendas não pode deixar o refresh token vencer. */
export async function renewConnection(): Promise<'renewed' | 'not-connected'> {
  const row = await readRow()
  if (!row || Date.parse(row.refresh_expires_at) <= Date.now()) return 'not-connected'
  await renew(row)
  return 'renewed'
}
