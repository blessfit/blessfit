/*
 * Renova a sessão do Supabase (cookies) a cada visita ao painel e às páginas da conta do cliente. Sem isto, o login expira em ~1h,
 * porque as páginas (Server Components) não conseguem gravar cookies.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of list) response.cookies.set(name, value, options)
      },
    },
  })
  await supabase.auth.getUser()
  return response
}

export const config = { matcher: ['/admin/:path*', '/entrar', '/criar-conta', '/conta/:path*', '/auth/:path*'] }
