/*
 * GET /auth/callback?code=…&next=… — volta do login com o Google (troca o código pela sessão).
 */
import { redirect } from 'next/navigation'
import { safeNext } from '@/lib/customer'
import { finishLogin } from '@/server/customers'
import { authClient } from '@/server/supabase'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const code = params.get('code')
  if (!code) redirect('/entrar?erro=google')

  const supabase = await authClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) redirect('/entrar?erro=google')

  await finishLogin(data.user)
  redirect(safeNext(params.get('next')))
}
