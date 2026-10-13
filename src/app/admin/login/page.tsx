import type { Metadata } from 'next'
import { signIn } from '../actions'
import s from '../admin.module.css'

export const metadata: Metadata = { title: 'Entrar · Painel Blessfit', robots: { index: false } }

const ERRORS: Record<string, string> = {
  senha: 'E-mail ou senha incorretos.',
  acesso: 'Este e-mail não tem acesso ao painel.',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams

  return (
    <div className={`${s.root} ${s.login}`}>
      <aside className={s.loginBrand}>
        <strong>blessfit</strong>
        <h2>Pedidos, estoque e preços da loja num lugar só.</h2>
        <p>Conforto · Performance · Estilo</p>
      </aside>
      <main className={s.loginMain}>
        <form action={signIn} className={s.loginForm}>
          <h1>Entrar no painel</h1>
          <p>Use o e-mail e a senha de administrador.</p>
          {erro && ERRORS[erro] && (
            <p className={s.error} role="alert">
              {ERRORS[erro]}
            </p>
          )}
          <label className={s.label}>
            E-mail
            <input className={s.input} name="email" type="email" autoComplete="email" required />
          </label>
          <label className={s.label}>
            Senha
            <input className={s.input} name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className={s.button} type="submit">
            Entrar
          </button>
        </form>
      </main>
    </div>
  )
}
