'use client'

/*
 * /entrar — "Acesse sua conta" (senha, link rápido por e-mail ou Google) e "Criar uma nova conta".
 */
import { useActionState, useState } from 'react'
import { Button, Check } from '@/components/ui'
import { requestPasswordReset, sendMagicLink, signInWithGoogle, signInWithPassword, type FormState } from '@/app/conta/actions'
import * as S from './Account.styles'
import { GoogleLogo, Input, PasswordInput } from './fields'

type Mode = 'password' | 'link' | 'reset'

const ERRORS: Record<string, string> = {
  link: 'O link expirou ou já foi usado. Peça um novo abaixo.',
  google: 'Não foi possível entrar com o Google. Tente de novo.',
}

const initial: FormState = {}

export function LoginView({ next, error }: { next: string; error?: string }) {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordState, passwordAction, passwordPending] = useActionState(signInWithPassword, initial)
  const [linkState, linkAction, linkPending] = useActionState(sendMagicLink, initial)
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordReset, initial)
  const signUpHref = next === '/conta' ? '/criar-conta' : `/criar-conta?next=${encodeURIComponent(next)}`

  return (
    <S.Duo>
      <S.Card aria-labelledby="entrar-titulo">
        <S.Title id="entrar-titulo">{mode === 'reset' ? 'Recuperar senha' : 'Acesse sua conta'}</S.Title>
        <S.Lead>
          {mode === 'reset'
            ? 'Informe o e-mail da sua conta. Enviamos um link para você criar uma senha nova.'
            : 'Acompanhe pedidos, veja seus dados e compre com mais facilidade.'}
        </S.Lead>

        {error && ERRORS[error] && (
          <S.Notice $tone="error" role="alert" style={{ marginTop: 18 }}>
            {ERRORS[error]}
          </S.Notice>
        )}

        {mode !== 'reset' && (
          <S.Tabs role="tablist" aria-label="Forma de entrar">
            <S.Tab type="button" role="tab" aria-selected={mode === 'password'} $active={mode === 'password'} onClick={() => setMode('password')}>
              Com senha
            </S.Tab>
            <S.Tab type="button" role="tab" aria-selected={mode === 'link'} $active={mode === 'link'} onClick={() => setMode('link')}>
              Link rápido por e-mail
            </S.Tab>
          </S.Tabs>
        )}

        {mode === 'password' && (
          <S.Form action={passwordAction}>
            <input type="hidden" name="next" value={next} />
            {passwordState.error && (
              <S.Notice $tone="error" role="alert">
                {passwordState.error}
              </S.Notice>
            )}
            <Input label="E-mail" name="email" type="email" required={false} value={email} onChange={setEmail} autoComplete="email" inputMode="email" placeholder="seu@email.com" />
            <PasswordInput
              value={password}
              onChange={setPassword}
              aside={
                <button type="button" onClick={() => setMode('reset')}>
                  Esqueceu a senha?
                </button>
              }
            />
            <Button as="button" type="submit" variant="primary" block disabled={passwordPending} aria-busy={passwordPending}>
              {passwordPending ? 'Entrando…' : 'Entrar na conta'}
            </Button>
          </S.Form>
        )}

        {mode === 'link' && (
          <S.Form action={linkAction}>
            <input type="hidden" name="next" value={next} />
            {linkState.sent ? (
              <S.Notice role="status">
                Se houver uma conta com <strong>{linkState.sent}</strong>, enviamos um link de acesso. Abra o e-mail neste aparelho
                para entrar.
              </S.Notice>
            ) : (
              <>
                {linkState.error && (
                  <S.Notice $tone="error" role="alert">
                    {linkState.error}
                  </S.Notice>
                )}
                <Input label="E-mail" name="email" type="email" required={false} value={email} onChange={setEmail} autoComplete="email" inputMode="email" placeholder="seu@email.com" />
                <Button as="button" type="submit" variant="primary" block disabled={linkPending} aria-busy={linkPending}>
                  {linkPending ? 'Enviando…' : 'Enviar link de acesso'}
                </Button>
              </>
            )}
          </S.Form>
        )}

        {mode === 'reset' && (
          <S.Form action={resetAction}>
            {resetState.sent ? (
              <S.Notice role="status">
                Se houver uma conta com <strong>{resetState.sent}</strong>, enviamos um link para criar uma senha nova.
              </S.Notice>
            ) : (
              <>
                {resetState.error && (
                  <S.Notice $tone="error" role="alert">
                    {resetState.error}
                  </S.Notice>
                )}
                <Input label="E-mail" name="email" type="email" required={false} value={email} onChange={setEmail} autoComplete="email" inputMode="email" placeholder="seu@email.com" />
                <Button as="button" type="submit" variant="primary" block disabled={resetPending} aria-busy={resetPending}>
                  {resetPending ? 'Enviando…' : 'Enviar link'}
                </Button>
              </>
            )}
            <S.Lead style={{ marginTop: 0, textAlign: 'center' }}>
              <button type="button" onClick={() => setMode('password')}>
                Voltar para o login
              </button>
            </S.Lead>
          </S.Form>
        )}

        {mode !== 'reset' && <GoogleForm next={next} />}
      </S.Card>

      <S.Card aria-labelledby="criar-titulo">
        <S.Subtitle id="criar-titulo" as="h2" style={{ fontSize: 'clamp(20px, 2.4vw, 24px)' }}>
          Criar uma nova conta
        </S.Subtitle>
        <S.Lead>Cadastre-se para comprar mais rápido, salvar seu endereço e acompanhar seus pedidos.</S.Lead>
        <S.Benefits>
          <li>
            <Check /> Checkout com seus dados já preenchidos
          </li>
          <li>
            <Check /> Acompanhamento do rastreio
          </li>
          <li>
            <Check /> Histórico de todos os pedidos
          </li>
        </S.Benefits>
        <Button variant="outline" block href={signUpHref}>
          Criar minha conta
        </Button>
        <S.Lead style={{ fontSize: 12, textAlign: 'center' }}>Não quer criar conta? Você também pode comprar sem cadastro.</S.Lead>
      </S.Card>
    </S.Duo>
  )
}

export function GoogleForm({ next }: { next: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next} />
      <S.Divider>ou continue com</S.Divider>
      <S.GoogleButton type="submit">
        <GoogleLogo /> Continuar com o Google
      </S.GoogleButton>
    </form>
  )
}
