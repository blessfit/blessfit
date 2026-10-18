/*
 * POST /api/proximas-pecas — grava uma resposta da pesquisa “Próximas peças”.
 * Validação em src/server/survey.ts. Limite de requisições: regra no Firewall da Vercel (docs/seguranca.md).
 */
import { json } from '@/server/orders'
import { parseSurvey, saveSurvey } from '@/server/survey'

const MAX_BYTES = 4096

export async function POST(request: Request): Promise<Response> {
  // recusa antes de ler o corpo quando o tamanho declarado já passa do limite
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES) return json({ error: 'Resposta grande demais' }, 413)
  const text = await request.text()
  if (new TextEncoder().encode(text).length > MAX_BYTES) return json({ error: 'Resposta grande demais' }, 413)

  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return json({ error: 'Resposta inválida' }, 400)
  }

  const parsed = parseSurvey(body)
  if (!parsed.ok) return json({ error: parsed.error }, parsed.status)

  try {
    if (parsed.row) await saveSurvey(parsed.row)
  } catch (err) {
    // sem dados da cliente no log
    console.error('[survey] erro ao gravar resposta', err instanceof Error ? err.message : err)
    return json({ error: 'Não foi possível enviar agora. Tente de novo em instantes.' }, 500)
  }

  return json({ ok: true })
}
