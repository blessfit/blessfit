/*
 * GET /auth/confirm — links dos e-mails (confirmar cadastro, acesso rápido e nova senha). Aceita os dois formatos:
 *
 * - ?code=…&next=…            templates padrão do Supabase (o link passa pelo Supabase e volta com o código;
 *                              precisa ser aberto no mesmo navegador em que o cliente pediu o e-mail)
 * - ?token_hash=…&type=…      templates editados (exige SMTP próprio; funciona em qualquer navegador)
 *
 * A troca de senha volta com next=/conta/nova-senha.
 */
import type { EmailOtpType, User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { safeNext } from '@/lib/customer'
import { finishLogin } from '@/server/customers'
import { authClient } from '@/server/supabase'

const TYPES: EmailOtpType[] = ['signup', 'email', 'magiclink', 'recovery', 'invite', 'email_change']

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const code = params.get('code')
  const tokenHash = params.get('token_hash')
  const type = params.get('type') as EmailOtpType | null
  const supabase = await authClient()

  let user: User | null = null
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) user = data.user
  } else if (tokenHash && type && TYPES.includes(type)) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) user = data.user
  }
  if (!user) redirect('/entrar?erro=link')

  await finishLogin(user)
  redirect(type === 'recovery' ? '/conta/nova-senha' : safeNext(params.get('next')))
}
