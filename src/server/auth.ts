/*
 * Acesso ao painel: login do Supabase Auth + lista de e-mails liberados em ADMIN_EMAILS
 * (separados por vírgula). Quem não estiver na lista não entra, mesmo com usuário e senha válidos.
 */
import type { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { authClient } from './supabase'

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase())
  return allowed.includes(email.toLowerCase())
}

/** Usuário logado e liberado; senão, manda para o login. Use no começo de toda página e ação do painel. */
export async function requireAdmin(): Promise<User> {
  const supabase = await authClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user || !isAdmin(data.user.email)) redirect('/admin/login')
  return data.user
}
