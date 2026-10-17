/*
 * GET /admin/proximas-pecas/exportar — baixa as respostas da pesquisa “Próximas peças” (.xlsx).
 * Só para administradores: a planilha tem contatos de clientes.
 */
import { requireAdmin } from '@/server/auth'
import { buildSurveyWorkbook } from '@/server/survey'

export async function GET(): Promise<Response> {
  await requireAdmin()
  const file = await buildSurveyWorkbook()
  const day = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date()).replace(/\//g, '-')
  const name = `Próximas peças BlessFit - ${day}.xlsx`

  return new Response(new Uint8Array(file), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="proximas-pecas-blessfit-${day}.xlsx"; filename*=UTF-8''${encodeURIComponent(name)}`,
      'Cache-Control': 'no-store',
    },
  })
}
