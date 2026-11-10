/*
 * GET /api/bling/callback — volta da autorização no Bling. Exige admin logado e `state` igual ao do cookie.
 * O código vale 30 segundos e só pode ser trocado uma vez: reutilizar faz o Bling revogar o usuário, então
 * esta rota nunca repete a troca.
 */
import { timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/server/auth'
import { accessToken, connect } from '@/server/nfe/auth'
import { BlingError, checkInvoiceAccess, emissionEnv } from '@/server/nfe/bling'
import { BLING_STATE_COOKIE, BLING_STATE_PATH, type BlingConnectResult } from '@/server/nfe/connection'

const sameText = (a: string, b: string) => {
  const [left, right] = [Buffer.from(a), Buffer.from(b)]
  return left.length === right.length && timingSafeEqual(left, right)
}

async function finish(code: string): Promise<BlingConnectResult> {
  try {
    await connect(code)
    await checkInvoiceAccess(await accessToken())
    return 'conectado'
  } catch (err) {
    const status = err instanceof BlingError ? err.status : undefined
    console.error(`[bling] falha ao conectar (HTTP ${status ?? 'sem resposta'})`)
    return status === 403 ? 'sem-acesso-nfe' : 'erro'
  }
}

export async function GET(request: Request): Promise<Response> {
  await requireAdmin()

  const store = await cookies()
  const [savedState, orderId] = (store.get(BLING_STATE_COOKIE)?.value ?? '').split('.')
  store.delete({ name: BLING_STATE_COOKIE, path: BLING_STATE_PATH })

  const params = new URL(request.url).searchParams
  const state = params.get('state') ?? ''
  const code = params.get('code')

  let result: BlingConnectResult
  if (!emissionEnv()) result = 'desligado'
  else if (!savedState || !sameText(savedState, state)) result = 'estado-invalido'
  else if (params.get('error') || !code) result = 'recusado'
  else result = await finish(code)

  const page = /^[0-9a-f-]{36}$/i.test(orderId ?? '') ? `/admin/pedidos/${orderId}` : '/admin/pedidos'
  redirect(`${page}?bling=${result}`)
}
