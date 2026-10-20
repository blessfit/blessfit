'use server'

/*
 * Ações da conta do cliente (docs/spec-conta.md). Toda ação é um endpoint público: as que mexem
 * na conta conferem o login com currentUser() antes de tocar no banco.
 */
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addressErrors, isCpf, isEmail, isFullName, isPassword, isPhone, safeNext, type AddressForm } from '@/lib/customer'
import { digits, normalizeCep } from '@/lib/documents'
import { isAdmin } from '@/server/auth'
import { cpfTaken, currentUser, finishLogin, isUniqueViolation, saveCustomer, type Customer } from '@/server/customers'
import type { ShippingAddress } from '@/server/orders'
import { authClient, db } from '@/server/supabase'

export type FormState = {
  error?: string
  fields?: Record<string, string>
  /** E-mail para onde foi mandado o link (confirmação, acesso rápido ou nova senha). */
  sent?: string
  ok?: boolean
  /** Cadastro barrado porque o e-mail ou o CPF já tem conta: a tela oferece entrar ou recuperar a senha. */
  exists?: boolean
}

// Não diz de quem é a conta do CPF (dado de terceiro, LGPD).
const EMAIL_TAKEN = 'Este e-mail já tem conta (inclusive pelo Google)'
const CPF_TAKEN = 'Este CPF já está em outra conta'
const CPF_IN_USE = 'Este CPF já está em outra conta. Fale com a gente no WhatsApp se ele for seu.'

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

/**
 * Login pelo popup do Google (Google Identity Services): o navegador recebe o ID token do Google e o
 * Supabase confere a assinatura e o nonce. Devolve para onde ir, ou o erro.
 */
export async function signInWithGoogleToken(credential: string, nonce: string, next: string): Promise<{ next?: string; error?: string }> {
  const supabase = await authClient()
  const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: credential, nonce })
  if (error || !data.user) {
    console.error('[conta] login pelo Google (popup)', error)
    return { error: 'Não foi possível entrar com o Google. Tente de novo.' }
  }
  await finishLogin(data.user)
  return { next: safeNext(next) }
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email').toLowerCase()
  const password = String(form.get('password') ?? '')
  const { profile, address, errors } = readProfile(form)
  if (!isEmail(email)) errors.email = 'E-mail inválido'
  if (!isPassword(password)) errors.password = 'Mínimo 8 caracteres, com letras e números'
  if (form.get('terms') !== 'on') errors.terms = 'Aceite a Política de Privacidade para criar a conta'
  if (Object.keys(errors).length > 0) return { fields: errors }

  // antes de criar no Supabase, senão ele já manda o e-mail de confirmação
  if (await cpfTaken(profile.cpf)) return { fields: { cpf: CPF_TAKEN }, exists: true }

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
    // com a confirmação de e-mail desligada, o Supabase recusa o e-mail repetido com este erro
    if (error.code === 'user_already_exists' || error.code === 'email_exists') return { fields: { email: EMAIL_TAKEN }, exists: true }
    console.error('[conta] erro no cadastro', error.code, error.message)
    return { error: 'Não foi possível criar a conta agora. Tente de novo em instantes.' }
  }

  // e-mail já cadastrado (e confirmado): o Supabase devolve um usuário "fantasma" sem identidades e não manda e-mail
  if (!data.user?.identities?.length) return { fields: { email: EMAIL_TAKEN }, exists: true }

  try {
    await saveCustomer(data.user.id, { ...profile, address, accepted_terms_at: new Date().toISOString() })
  } catch (err) {
    if (!isUniqueViolation(err)) throw err
    // o CPF entrou em outra conta entre a conferência e agora
    return { fields: { cpf: CPF_TAKEN }, exists: true }
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
  if (await cpfTaken(profile.cpf, user.id)) return { fields: { cpf: CPF_IN_USE } }
  try {
    await saveCustomer(user.id, fields)
  } catch (err) {
    if (!isUniqueViolation(err)) throw err
    return { fields: { cpf: CPF_IN_USE } }
  }
  revalidatePath('/conta', 'layout') // o "Olá, Nome" do menu da conta
  return { ok: true }
}

/** Sem redirect: quem chama recarrega a página (useSignOut). */
export async function signOut(): Promise<void> {
  const supabase = await authClient()
  await supabase.auth.signOut({ scope: 'local' })
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
