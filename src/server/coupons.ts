/*
 * Cupons do checkout, cadastrados pelo painel em /admin/cupons (docs/spec-cupons.md).
 *
 * - Desconto percentual só nos itens: o frete nunca tem desconto.
 * - Usos = pedidos pagos com o código (status em SOLD). Não há contador: carrinho abandonado ou pedido
 *   cancelado não gasta o cupom, e nada precisa mudar no webhook.
 * - O limite é conferido no checkout, sem reserva: dois pagamentos juntos no último uso passam os dois, e o
 *   painel mostra o excesso (spec §0, opção A).
 */
import 'server-only'
import { SOLD } from './admin'
import type { OrderItem } from './orders'
import { db } from './supabase'

export type Coupon = {
  code: string
  percent: number
  /** null = sem limite. */
  max_uses: number | null
  first_purchase_only: boolean
  starts_at: string | null
  ends_at: string | null
  active: boolean
  created_at: string
}

/** Situação do cupom no painel; `active` é o único em que ele vale. */
export type CouponState = 'active' | 'inactive' | 'scheduled' | 'expired' | 'exhausted'

export const COUPON_CODE = /^[A-Z0-9]{3,20}$/

/** Código como fica no banco: maiúsculas, sem espaços. */
export const normalizeCode = (code: string) => code.replace(/\s+/g, '').toUpperCase()

export function couponState(coupon: Coupon, uses: number, now = new Date()): CouponState {
  if (!coupon.active) return 'inactive'
  if (coupon.starts_at && now < new Date(coupon.starts_at)) return 'scheduled'
  if (coupon.ends_at && now >= new Date(coupon.ends_at)) return 'expired'
  if (coupon.max_uses !== null && uses >= coupon.max_uses) return 'exhausted'
  return 'active'
}

/** Cupom pelo código digitado (sem diferenciar maiúsculas), ou null se não existir. */
export async function findCoupon(code: string): Promise<Coupon | null> {
  const normalized = normalizeCode(code)
  if (!COUPON_CODE.test(normalized)) return null
  const { data, error } = await db().from('coupons').select('*').eq('code', normalized).maybeSingle<Coupon>()
  if (error) throw error
  return data
}

/** Pedidos pagos com o cupom. */
export async function couponUses(code: string): Promise<number> {
  const { count, error } = await db()
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('coupon_code', code)
    .in('status', SOLD)
  if (error) throw error
  return count ?? 0
}

async function hasPaidOrder(cpf: string): Promise<boolean> {
  const { count, error } = await db()
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_cpf', cpf)
    .in('status', SOLD)
  if (error) throw error
  return !!count
}

const REFUSALS: Record<Exclude<CouponState, 'active'>, (code: string) => string> = {
  // não revela que o cupom existiu
  inactive: () => 'Cupom inválido',
  scheduled: () => 'Este cupom não está valendo',
  expired: () => 'Este cupom não está valendo',
  exhausted: (code) => `O cupom ${code} esgotou`,
}

/**
 * Motivo da recusa, ou null se o cupom vale. Ordem: desligado, fora da validade, esgotado, primeira compra.
 * Sem CPF (o carrinho ainda não tem), a primeira compra fica para o checkout conferir.
 */
export async function checkCoupon(coupon: Coupon, cpf: string | null, now = new Date()): Promise<string | null> {
  const state = couponState(coupon, coupon.max_uses === null ? 0 : await couponUses(coupon.code), now)
  if (state !== 'active') return REFUSALS[state](coupon.code)
  if (coupon.first_purchase_only && cpf && (await hasPaidOrder(cpf))) return `O cupom ${coupon.code} vale só na primeira compra`
  return null
}

/** Todos os cupons, com os usos de cada um, para o painel. Mais novos primeiro. */
export async function listCoupons(): Promise<{ coupon: Coupon; uses: number }[]> {
  const [coupons, orders] = await Promise.all([
    db().from('coupons').select('*').order('created_at', { ascending: false }).returns<Coupon[]>(),
    db().from('orders').select('coupon_code').not('coupon_code', 'is', null).in('status', SOLD).returns<{ coupon_code: string }[]>(),
  ])
  if (coupons.error) throw coupons.error
  if (orders.error) throw orders.error
  const uses = new Map<string, number>()
  for (const { coupon_code } of orders.data) uses.set(coupon_code, (uses.get(coupon_code) ?? 0) + 1)
  return coupons.data.map((coupon) => ({ coupon, uses: uses.get(coupon.code) ?? 0 }))
}

/** Campos do formulário do painel, como o navegador manda (datas de `datetime-local`, horário de Brasília). */
export type CouponForm = {
  percent: string
  maxUses: string
  startsAt: string
  endsAt: string
  firstPurchaseOnly: boolean
}

export type CouponFields = Pick<Coupon, 'percent' | 'max_uses' | 'starts_at' | 'ends_at' | 'first_purchase_only'>

/** "2026-11-20T10:00" no horário de Brasília → ISO; vazio → null; inválido → undefined. */
function brasiliaDate(value: string): string | null | undefined {
  const raw = value.trim()
  if (!raw) return null
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return undefined
  const date = new Date(`${raw}:00-03:00`) // Brasília não tem horário de verão desde 2019
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/** Valida o formulário do painel com as mesmas regras da tabela, com mensagem em português. */
export function parseCouponForm(input: CouponForm): { ok: true; fields: CouponFields } | { ok: false; error: string } {
  // vem de uma server action (endpoint público): não confiar no formato
  const text = (value: unknown) => (typeof value === 'string' ? value.slice(0, 40) : '')
  const form = {
    percent: text(input?.percent),
    maxUses: text(input?.maxUses),
    startsAt: text(input?.startsAt),
    endsAt: text(input?.endsAt),
    firstPurchaseOnly: input?.firstPurchaseOnly === true,
  }
  const percent = form.percent.trim() ? Number(form.percent.trim()) : Number.NaN
  if (!Number.isInteger(percent) || percent < 1 || percent > 90) return { ok: false, error: 'O desconto vai de 1% a 90%, sem casas decimais' }

  const maxRaw = form.maxUses.trim()
  const maxUses = maxRaw ? Number(maxRaw) : null
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) return { ok: false, error: 'O limite de usos é um número inteiro a partir de 1 (vazio = sem limite)' }

  const startsAt = brasiliaDate(form.startsAt)
  const endsAt = brasiliaDate(form.endsAt)
  if (startsAt === undefined || endsAt === undefined) return { ok: false, error: 'Data inválida' }
  if (startsAt && endsAt && endsAt <= startsAt) return { ok: false, error: 'O fim precisa ser depois do início' }

  return {
    ok: true,
    fields: { percent, max_uses: maxUses, starts_at: startsAt, ends_at: endsAt, first_purchase_only: form.firstPurchaseOnly },
  }
}

/** Desconto de cada unidade, em centavos (arredondado por unidade, igual no site e na InfinitePay). */
export const unitDiscount = (price: number, coupon: Pick<Coupon, 'percent'>) => Math.round((price * coupon.percent) / 100)

export const discountOf = (items: OrderItem[], coupon: Pick<Coupon, 'percent'> | null) =>
  coupon ? items.reduce((sum, item) => sum + unitDiscount(item.price, coupon) * item.quantity, 0) : 0
