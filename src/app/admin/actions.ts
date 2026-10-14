'use server'

/*
 * Ações do painel. Toda ação é um endpoint público: cada uma confere o login com requireAdmin()
 * antes de tocar no banco.
 */
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CATALOG } from '@/data/catalog'
import { isAdmin, requireAdmin } from '@/server/auth'
import type { OrderStatus } from '@/server/orders'
import { authClient, db } from '@/server/supabase'
import { ORDER_STATUSES } from './labels'

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function signIn(form: FormData) {
  const email = String(form.get('email') ?? '').trim()
  const password = String(form.get('password') ?? '')
  const supabase = await authClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/admin/login?erro=senha')
  if (!isAdmin(email)) {
    await supabase.auth.signOut()
    redirect('/admin/login?erro=acesso')
  }
  redirect('/admin')
}

export async function signOut() {
  const supabase = await authClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function updateOrderStatus(form: FormData) {
  await requireAdmin()
  const id = String(form.get('id') ?? '')
  const status = String(form.get('status') ?? '') as OrderStatus
  if (!ORDER_STATUSES.includes(status)) throw new Error('Status inválido')

  const { error } = await db().from('orders').update({ status }).eq('id', id)
  if (error) throw error
  revalidatePath('/admin/(painel)', 'layout')
}

/** "154,90", "1.154,90" ou "154.90" → número; vazio → null; inválido → NaN. */
function money(value: string): number | null {
  const raw = value.trim()
  if (!raw) return null
  // com vírgula, o ponto é separador de milhar (1.154,90); sem vírgula, o ponto é o decimal (154.90)
  const number = Number(raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw)
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) / 100 : Number.NaN
}

/** Estoque de um produto: quantidade por cor × tamanho (null = sem controle). */
export async function saveStock(
  productId: string,
  rows: { color: string; size: string; quantity: number | null }[],
): Promise<ActionResult> {
  await requireAdmin()
  const product = CATALOG.find((p) => p.id === productId)
  if (!product) return { ok: false, error: 'Produto não encontrado' }

  for (const row of rows) {
    if (!product.variants.some((v) => v.color.name === row.color) || !product.sizes.some((s) => s === row.size)) {
      return { ok: false, error: `Cor ou tamanho inválido: ${row.color} ${row.size}` }
    }
    if (row.quantity !== null && (!Number.isInteger(row.quantity) || row.quantity < 0)) {
      return { ok: false, error: `Quantidade inválida em ${row.color} ${row.size}` }
    }
  }

  const now = new Date().toISOString()
  const { error } = await db()
    .from('stock')
    .upsert(rows.map((row) => ({ product_id: product.id, ...row, updated_at: now })))
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/(painel)', 'layout')
  return { ok: true }
}

/** Preço no cartão, no Pix, preço “de” e se o produto está à venda. Valores como digitados (ex.: "154,90"). */
export async function savePrices(
  productId: string,
  input: { price: string; pix: string; compareAt: string; active: boolean },
): Promise<ActionResult> {
  await requireAdmin()
  const product = CATALOG.find((p) => p.id === productId)
  if (!product) return { ok: false, error: 'Produto não encontrado' }

  const price = money(input.price)
  const pix = money(input.pix)
  const compareAt = money(input.compareAt)
  if (price === null || Number.isNaN(price)) return { ok: false, error: 'Preço no cartão inválido' }
  if (pix === null || Number.isNaN(pix)) return { ok: false, error: 'Preço no Pix inválido' }
  if (compareAt !== null && Number.isNaN(compareAt)) return { ok: false, error: 'Preço “de” inválido' }
  // travas contra erro de digitação (ex.: 1039,90 no lugar de 139,90), que viram cobrança errada no checkout
  if (pix > price) return { ok: false, error: 'O preço no Pix não pode ser maior que o do cartão' }
  if (pix < price / 2) return { ok: false, error: 'O preço no Pix está com mais de 50% de desconto: confira os valores' }
  if (compareAt !== null && compareAt <= price) return { ok: false, error: 'O preço “de” precisa ser maior que o preço no cartão' }

  const { error } = await db().from('products').upsert({
    id: product.id,
    price,
    pix,
    compare_at: compareAt,
    active: input.active,
    updated_at: new Date().toISOString(),
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/(painel)', 'layout')
  return { ok: true }
}
