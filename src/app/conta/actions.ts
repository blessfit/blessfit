'use server'

/*
 * Ações da conta do cliente (docs/spec-conta.md). Toda ação é um endpoint público: as que mexem
 * na conta conferem o login com currentUser() antes de tocar no banco.
 */
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { addressErrors, isCpf, isEmail, isFullName, isPassword, isPhone, safeNext, type AddressForm } from '@/lib/customer'
import { digits, normalizeCep } from '@/lib/documents'
import { isAdmin } from '@/server/auth'
import { currentUser, finishLogin, saveCustomer, type Customer } from '@/server/customers'
import type { ShippingAddress } from '@/server/orders'
import { authClient, db } from '@/server/supabase'

export type FormState = {
  error?: string
  fields?: Record<string, string>
  /** E-mail para onde foi mandado o link (confirmação, acesso rápido ou nova senha). */
  sent?: string
  ok?: boolean
}

const str = (form: FormData, key: string) => String(form.get(key) ?? '').trim()

/** Endereço do site que fez o pedido (produção, HML ou localhost), para os links dos e-mails. */
async function origin(): Promise<string> {
  const h = await headers()
  return h.get('origin') ?? `https://${h.get('host')}`
}

function readAddress(form: FormData): { address: ShippingAddress | null; errors: Record<string, string> } {
  const raw: AddressForm = {
    cep: str(form, 'cep'),
    street: str(form, 'street'),
    number: str(form, 'number'),
    complement: str(form, 'complement'),
    district: str(form, 'district'),
    city: str(form, 'city'),
    uf: str(form, 'uf').toUpperCase(),
  }
  // endereço opcional: CEP vazio = sem endereço
  if (!raw.cep) return { address: null, errors: {} }
  const errors = addressErrors(raw)
  if (Object.keys(errors).length > 0) return { address: null, errors }
  const { complement, ...rest } = raw
  return { address: { ...rest, cep: normalizeCep(raw.cep)!, ...(complement ? { complement } : {}) }, errors: {} }
}

function readProfile(form: FormData) {
  const profile = { name: str(form, 'name').slice(0, 120), cpf: digits(str(form, 'cpf')), phone: digits(str(form, 'phone')) }
  const errors: Record<string, string> = {}
  if (!isFullName(profile.name)) errors.name = 'Informe nome e sobrenome'
  if (!isCpf(profile.cpf)) errors.cpf = 'CPF inválido'
  if (!isPhone(profile.phone)) errors.phone = 'Telefone com DDD'
  const { address, errors: addressErr } = readAddress(form)
  return { profile, address, errors: { ...errors, ...addressErr } }
}

export async function signInWithPassword(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email')
  const password = String(form.get('password') ?? '')
  const supabase = await authClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.code === 'email_not_confirmed') return { error: 'Confirme seu e-mail pelo link que enviamos antes de entrar.' }
    return { error: 'E-mail ou senha incorretos.' }
  }
  await finishLogin(data.user)
  redirect(safeNext(form.get('next')))
}

export async function sendMagicLink(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email')
  if (!isEmail(email)) return { error: 'E-mail inválido.' }
  const next = safeNext(form.get('next'))
  const supabase = await authClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // só para quem já tem conta (cadastro é em /criar-conta); a resposta é a mesma para não revelar quem tem conta
    options: { shouldCreateUser: false, emailRedirectTo: `${await origin()}/auth/confirm?next=${encodeURIComponent(next)}` },
  })
  if (error && error.status === 429) return { error: 'Muitas tentativas. Espere alguns minutos e tente de novo.' }
  return { sent: email }
}

export async function signInWithGoogle(form: FormData): Promise<void> {
  const next = safeNext(form.get('next'))
  const supabase = await authClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  })
  if (error || !data.url) redirect('/entrar?erro=google')
  redirect(data.url)
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email').toLowerCase()
  const password = String(form.get('password') ?? '')
  const { profile, address, errors } = readProfile(form)
  if (!isEmail(email)) errors.email = 'E-mail inválido'
  if (!isPassword(password)) errors.password = 'Mínimo 8 caracteres, com letras e números'
  if (form.get('terms') !== 'on') errors.terms = 'Aceite a Política de Privacidade para criar a conta'
  if (Object.keys(errors).length > 0) return { fields: errors }

  const next = safeNext(form.get('next'))
  const supabase = await authClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await origin()}/auth/confirm?next=${encodeURIComponent(next)}`, data: { full_name: profile.name } },
  })
  if (error) {
    if (error.code === 'weak_password') return { fields: { password: 'Senha fraca: use 8+ caracteres, com letras e números' } }
    if (error.status === 429) return { error: 'Muitas tentativas. Espere alguns minutos e tente de novo.' }
    console.error('[conta] erro no cadastro', error.code, error.message)
    return { error: 'Não foi possível criar a conta agora. Tente de novo em instantes.' }
  }

  // e-mail já cadastrado: o Supabase devolve um usuário "fantasma" sem identidades (não salva nada)
  if (data.user && data.user.identities?.length) {
    await saveCustomer(data.user.id, { ...profile, address, accepted_terms_at: new Date().toISOString() })
  }
  // confirmação de e-mail desligada no Supabase: já entra direto
  if (data.session && data.user) {
    await finishLogin(data.user)
    redirect(next)
  }
  return { sent: email }
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email')
  if (!isEmail(email)) return { error: 'E-mail inválido.' }
  const supabase = await authClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/confirm?next=/conta/nova-senha`,
  })
  if (error && error.status === 429) return { error: 'Muitas tentativas. Espere alguns minutos e tente de novo.' }
  return { sent: email }
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser()
  if (!user) redirect('/entrar?erro=link')
  const password = String(form.get('password') ?? '')
  if (!isPassword(password)) return { fields: { password: 'Mínimo 8 caracteres, com letras e números' } }
  if (password !== String(form.get('confirm') ?? '')) return { fields: { confirm: 'As senhas não são iguais' } }
  const supabase = await authClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    if (error.code === 'same_password') return { fields: { password: 'Use uma senha diferente da anterior' } }
    return { error: 'Não foi possível trocar a senha. Peça um novo link.' }
  }
  redirect('/conta/dados?senha=ok')
}

export async function saveProfile(_: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser()
  if (!user) redirect('/entrar?next=/conta')
  const { profile, address, errors } = readProfile(form)
  if (Object.keys(errors).length > 0) return { fields: errors }
  const fields: Partial<Customer> = { ...profile, address }
  await saveCustomer(user.id, fields)
  return { ok: true }
}

export async function signOut(): Promise<void> {
  const supabase = await authClient()
  await supabase.auth.signOut({ scope: 'local' })
  redirect('/')
}

export async function deleteAccount(_: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser()
  if (!user) redirect('/entrar?next=/conta')
  if (str(form, 'confirm').toUpperCase() !== 'EXCLUIR') return { error: 'Digite EXCLUIR para confirmar.' }
  // um e-mail de administrador não se apaga por aqui (perderia o acesso ao painel)
  if (isAdmin(user.email)) return { error: 'Esta conta é de administrador e não pode ser excluída por aqui.' }
  const { error } = await db().auth.admin.deleteUser(user.id)
  if (error) {
    console.error('[conta] erro ao excluir conta', error)
    return { error: 'Não foi possível excluir a conta. Fale com a gente no WhatsApp.' }
  }
  const supabase = await authClient()
  await supabase.auth.signOut({ scope: 'local' })
  redirect('/')
}
