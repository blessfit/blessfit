/*
 * Cupons do checkout. Desligados por enquanto (lista vazia: todo código é recusado).
 * Para voltar, cadastre aqui, ex.: { code: 'BLESS10', percent: 10 }; vale se o CPF ainda não tem pedido pago.
 */
import 'server-only'
import { SOLD } from './admin'
import type { OrderItem } from './orders'
import { db } from './supabase'

export type Coupon = { code: string; percent: number }

const COUPONS: Coupon[] = []

/** Cupom pelo código digitado (sem diferenciar maiúsculas), ou null se não existir. */
export const findCoupon = (code: string): Coupon | null =>
  COUPONS.find((c) => c.code === code.trim().toUpperCase()) ?? null

/** Erro se o CPF já tem pedido pago (o cupom é só para a primeira compra). */
export async function checkFirstPurchase(coupon: Coupon, cpf: string): Promise<string | null> {
  const { count, error } = await db()
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_cpf', cpf)
    .in('status', SOLD)
  if (error) throw error
  return count ? `O cupom ${coupon.code} vale só na primeira compra` : null
}

/** Desconto de cada unidade, em centavos (arredondado por unidade, igual no site e na InfinitePay). */
export const unitDiscount = (price: number, coupon: Coupon) => Math.round((price * coupon.percent) / 100)

export const discountOf = (items: OrderItem[], coupon: Coupon | null) =>
  coupon ? items.reduce((sum, item) => sum + unitDiscount(item.price, coupon) * item.quantity, 0) : 0
