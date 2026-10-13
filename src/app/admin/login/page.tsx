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
    <div className={`${s.shell} ${s.login}`}>
      <form action={signIn} className={s.loginCard}>
        <h1>Painel Blessfit</h1>
        <p className={s.muted}>Entre com o seu e-mail e senha.</p>
        {erro && ERRORS[erro] && <p className={s.error}>{ERRORS[erro]}</p>}
        <label className={s.field}>
          E-mail
          <input className={s.input} name="email" type="email" autoComplete="email" required />
        </label>
        <label className={s.field}>
          Senha
          <input className={s.input} name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className={s.button} type="submit">
          Entrar
        </button>
      </form>
    </div>
  )
}
