/*
 * POST /api/shipping/quote — opções de frete para a sacola.
 *
 * Corpo: { cep: '30130-010', lines: [{ id, color, size, qty }] }
 * Resposta: { options: [{ id, name, carrier, price, days: { min, max }, free, cheapest, fastest }], source }
 * `price` em reais; `id` e `price` voltam em POST /api/checkout (shipping).
 * Peso e preço são calculados aqui, nunca vêm do navegador.
 */
import { normalizeCep } from '@/lib/documents'
import { json, priceCart } from '@/server/orders'
import { publicOption, quoteShipping } from '@/server/shipping/quote'
import { getLiveCatalog } from '@/server/supabase'

export async function POST(request: Request): Promise<Response> {
  let body: { cep?: unknown; lines?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const cep = typeof body.cep === 'string' ? normalizeCep(body.cep) : null
  if (!cep) return json({ error: 'CEP inválido' }, 400)

  const priced = priceCart(body.lines, 'card', await getLiveCatalog())
  if ('error' in priced) return json({ error: priced.error }, 400)

  try {
    const { options, source } = await quoteShipping(cep, priced.items)
    return json({ options: options.map(publicOption), source })
  } catch (err) {
    console.error('[frete] erro na cotação', err)
    return json({ error: 'Não foi possível calcular o frete' }, 500)
  }
}
