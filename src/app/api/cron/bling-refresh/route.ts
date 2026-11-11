/*
 * GET /api/cron/bling-refresh — renova os tokens do Bling, para um período sem vendas não deixar o refresh
 * token (30 dias) vencer. Exige `Authorization: Bearer CRON_SECRET`, que a Vercel envia nas execuções do cron.
 */
import { timingSafeEqual } from 'node:crypto'
import { renewConnection } from '@/server/nfe/auth'
import { BlingError, emissionEnv } from '@/server/nfe/bling'

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(request.headers.get('authorization') ?? '')
  return received.length === expected.length && timingSafeEqual(received, expected)
}

export async function GET(request: Request): Promise<Response> {
  if (!authorized(request)) return Response.json({ error: 'unauthorized' }, { status: 401 })
  if (!emissionEnv()) return Response.json({ result: 'disabled' })

  try {
    return Response.json({ result: await renewConnection() })
  } catch (err) {
    const status = err instanceof BlingError ? err.status : undefined
    console.error(`[bling] falha ao renovar os tokens (HTTP ${status ?? 'sem resposta'})`)
    return Response.json({ error: 'refresh_failed' }, { status: 502 })
  }
}
