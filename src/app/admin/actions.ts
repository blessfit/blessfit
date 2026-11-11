'use server'

/*
 * Ações do painel. Toda ação é um endpoint público: cada uma confere o login com requireAdmin()
 * antes de tocar no banco.
 */
import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CATALOG } from '@/data/catalog'
import { isAdmin, requireAdmin } from '@/server/auth'
import { COUPON_CODE, normalizeCode, parseCouponForm, type CouponForm } from '@/server/coupons'
import { authorizeUrl, emissionEnv } from '@/server/nfe/bling'
import { BLING_STATE_COOKIE, BLING_STATE_PATH } from '@/server/nfe/connection'
import { issueInvoice, refreshInvoice, releaseInvoice } from '@/server/nfe/issue'
import type { OrderStatus } from '@/server/orders'
import { cancelLabel, generateLabel, labelUrl, type LabelResult } from '@/server/shipping/label'
import { anonymizeSurveyContact } from '@/server/survey'
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

/**
 * Preço no cartão, no Pix, preço “de”, se o produto está à venda e se tem frete grátis.
 * Valores como digitados (ex.: "154,90").
 */
export async function savePrices(
  productId: string,
  input: { price: string; pix: string; compareAt: string; active: boolean; freeShipping: boolean },
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
    free_shipping: input.freeShipping,
    updated_at: new Date().toISOString(),
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/(painel)', 'layout')
  return { ok: true }
}

/** Cupons (docs/spec-cupons.md §4). O código não muda depois de criado e cupom não se apaga: só desliga. */
export async function createCoupon(code: string, form: CouponForm): Promise<ActionResult> {
  await requireAdmin()
  const normalized = normalizeCode(String(code).slice(0, 40))
  if (!COUPON_CODE.test(normalized)) return { ok: false, error: 'Código com 3 a 20 letras ou números, sem espaços nem acentos' }
  const parsed = parseCouponForm(form)
  if (!parsed.ok) return parsed

  const { error } = await db().from('coupons').insert({ code: normalized, ...parsed.fields })
  if (error) return { ok: false, error: error.code === '23505' ? `Já existe o cupom ${normalized}` : error.message }
  revalidatePath('/admin/(painel)/cupons', 'page')
  return { ok: true }
}

export async function updateCoupon(code: string, form: CouponForm): Promise<ActionResult> {
  await requireAdmin()
  const parsed = parseCouponForm(form)
  if (!parsed.ok) return parsed

  const { data, error } = await db().from('coupons').update(parsed.fields).eq('code', normalizeCode(String(code))).select('code')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Cupom não encontrado' }
  revalidatePath('/admin/(painel)/cupons', 'page')
  return { ok: true }
}

export async function setCouponActive(code: string, active: boolean): Promise<ActionResult> {
  await requireAdmin()
  const { data, error } = await db().from('coupons').update({ active: active === true }).eq('code', normalizeCode(String(code))).select('code')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Cupom não encontrado' }
  revalidatePath('/admin/(painel)/cupons', 'page')
  return { ok: true }
}

/** Etiqueta do Melhor Envio: compra com o saldo e gera (`acceptCents` confirma um custo acima da cotação). */
export async function createShippingLabel(orderId: string, nfeKey: string, acceptCents?: number): Promise<LabelResult> {
  await requireAdmin()
  const result = await generateLabel(orderId, nfeKey, acceptCents)
  revalidatePath('/admin/(painel)', 'layout')
  return result
}

export async function printShippingLabel(orderId: string) {
  await requireAdmin()
  const result = await labelUrl(orderId)
  revalidatePath(`/admin/pedidos/${orderId}`)
  return result
}

export async function cancelShippingLabel(orderId: string): Promise<ActionResult> {
  await requireAdmin()
  const result = await cancelLabel(orderId)
  revalidatePath('/admin/(painel)', 'layout')
  return result
}

/** Leva o admin para autorizar o aplicativo no Bling. O `state` fica em cookie para validar o retorno. */
export async function connectBling(form: FormData) {
  await requireAdmin()
  if (!emissionEnv()) return
  const orderId = String(form.get('orderId') ?? '')
  const state = randomBytes(24).toString('hex')
  const store = await cookies()
  store.set(BLING_STATE_COOKIE, `${state}.${orderId}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: BLING_STATE_PATH,
    maxAge: 10 * 60,
  })
  redirect(authorizeUrl(state))
}

/** NF-e pelo Bling: cria, envia à Sefaz e grava a chave (também é o "Tentar de novo" depois de rejeição). */
export async function issueNfe(orderId: string): Promise<ActionResult> {
  await requireAdmin()
  const result = await issueInvoice(orderId)
  revalidatePath('/admin/(painel)', 'layout')
  return result.ok ? { ok: true } : result
}

/** Consulta a nota em andamento. Nunca cria nem envia outra. */
export async function refreshNfe(orderId: string): Promise<ActionResult> {
  await requireAdmin()
  const result = await refreshInvoice(orderId)
  revalidatePath('/admin/(painel)', 'layout')
  return result.ok ? { ok: true } : result
}

/** Libera uma emissão que travou antes de o Bling devolver o id. O admin confere no Bling antes. */
export async function releaseNfe(orderId: string): Promise<ActionResult> {
  await requireAdmin()
  const result = await releaseInvoice(orderId)
  revalidatePath('/admin/(painel)', 'layout')
  return result
}

/** Pesquisa “Próximas peças”: apaga nome, WhatsApp e e-mail de uma resposta (pedido de exclusão). */
export async function removeSurveyContact(form: FormData) {
  await requireAdmin()
  await anonymizeSurveyContact(String(form.get('id') ?? ''))
  revalidatePath('/admin/proximas-pecas')
}
