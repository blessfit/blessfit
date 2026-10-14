/*
 * GET /admin/exportar — baixa a planilha de estoque, preços e vendas (.xlsx). Só para administradores.
 */
import { requireAdmin } from '@/server/auth'
import { buildWorkbook } from '@/server/export'

export async function GET(): Promise<Response> {
  await requireAdmin()
  const file = await buildWorkbook()
  const day = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date()).replace(/\//g, '-')
  const name = `Estoque BlessFit (com conjuntos) - ${day}.xlsx`

  return new Response(new Uint8Array(file), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="estoque-blessfit-${day}.xlsx"; filename*=UTF-8''${encodeURIComponent(name)}`,
      'Cache-Control': 'no-store',
    },
  })
}
