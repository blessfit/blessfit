/*
 * Conta do cliente da loja (docs/spec-conta.md): sessão, perfil em `customers` e pedidos da conta.
 * O perfil só é lido e gravado aqui, com a chave secreta (a tabela não tem policies de RLS).
 */
import 'server-only'
import type { User } from '@supabase/supabase-js'
import type { OrderStatus, PayMethod, ShippingAddress } from './orders'
import { authClient, db } from './supabase'

export type Customer = {
  name: string | null
  cpf: string | null
  phone: string | null
  address: ShippingAddress | null
}

export type CustomerOrder = {
  id: string
  status: OrderStatus
  method: PayMethod
  total_cents: number
  created_at: string
  items: { description: string; quantity: number }[]
}

/** Usuário logado (token validado no Supabase), ou null. */
export async function currentUser(): Promise<User | null> {
  try {
    const { data } = await (await authClient()).auth.getUser()
    return data.user
  } catch {
    // Supabase não configurado
    return null
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const { data, error } = await db().from('customers').select('name, cpf, phone, address').eq('id', id).maybeSingle<Customer>()
  if (error) throw error
  return data
}

export async function saveCustomer(id: string, fields: Partial<Customer> & { accepted_terms_at?: string }): Promise<void> {
  const { error } = await db()
    .from('customers')
    .upsert({ id, ...fields, updated_at: new Date().toISOString() })
  if (error) throw error
}

/** O CPF já está em outra conta? (cada CPF é de uma conta só: índice único em customers.cpf) */
export async function cpfTaken(cpf: string, exceptId?: string): Promise<boolean> {
  let query = db().from('customers').select('id', { count: 'exact', head: true }).eq('cpf', cpf)
  if (exceptId) query = query.neq('id', exceptId)
  const { count, error } = await query
  if (error) throw error
  return (count ?? 0) > 0
}

/** Erro do Postgres de valor repetido num índice único (ex.: o CPF entrou em outra conta ao mesmo tempo). */
export const isUniqueViolation = (err: unknown) => (err as { code?: string } | null)?.code === '23505'

/**
 * Depois de um pedido logado: guarda nome, celular e endereço usados. O CPF só entra se ainda não houver um
 * e se não for de outra conta (o pedido segue normal; só não fica salvo no perfil).
 */
export async function rememberCheckout(id: string, data: { name: string; cpf: string; phone: string; address: ShippingAddress }) {
  const current = await getCustomer(id)
  const keepCpf = current?.cpf || (await cpfTaken(data.cpf, id))
  await saveCustomer(id, { name: data.name, phone: data.phone, address: data.address, ...(keepCpf ? {} : { cpf: data.cpf }) })
}

export async function listCustomerOrders(userId: string): Promise<CustomerOrder[]> {
  const { data, error } = await db()
    .from('orders')
    .select('id, status, method, total_cents, created_at, items')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<CustomerOrder[]>()
  if (error) throw error
  return data
}

/**
 * Fim de qualquer login (senha, link, Google): cria o perfil se faltar (com o nome do Google) e
 * traz para a conta os pedidos feitos sem login com o mesmo e-mail — só com e-mail confirmado.
 */
export async function finishLogin(user: User): Promise<void> {
  try {
    const meta = user.user_metadata as { full_name?: string; name?: string } | undefined
    await db()
      .from('customers')
      .upsert({ id: user.id, name: meta?.full_name ?? meta?.name ?? null }, { onConflict: 'id', ignoreDuplicates: true })
    if (user.email && user.email_confirmed_at) {
      await db().rpc('link_guest_orders', { p_user: user.id, p_email: user.email })
    }
  } catch (err) {
    // o login já valeu; perfil e pedidos antigos ficam para a próxima entrada
    console.error('[conta] erro ao concluir o login', err)
  }
}
