'use client'

/*
 * /criar-conta — cadastro em duas etapas: dados (obrigatórios) e endereço (opcional).
 */
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui'
import { signUp, type FormState } from '@/app/conta/actions'
import { EMPTY_ADDRESS, mask } from '@/lib/customer'
import * as C from '../Cart/Cart.styles'
import * as S from './Account.styles'
import { AddressFields, Input, PasswordInput } from './fields'
import { GoogleForm } from './LoginView'

const initial: FormState = {}

export function SignUpView({ next }: { next: string }) {
  const [profile, setProfile] = useState({ name: '', cpf: '', phone: '', email: '' })
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [state, action, pending] = useActionState(signUp, initial)
  const errors = state.fields ?? {}
  const set = (key: keyof typeof profile) => (value: string) => setProfile((p) => ({ ...p, [key]: value }))
  const loginHref = next === '/conta' ? '/entrar' : `/entrar?next=${encodeURIComponent(next)}`

  if (state.sent) {
    return (
      <S.Narrow>
        <S.Card>
          <S.Title>Confirme seu e-mail</S.Title>
          <S.Lead>
            Enviamos um link de confirmação para <strong>{state.sent}</strong>. Abra o e-mail e toque no link para ativar sua conta.
            Não chegou? Confira o spam ou a aba Promoções.
          </S.Lead>
          {/* e-mail já cadastrado: o Supabase não manda nada (e não conta, para não revelar quem é cliente) */}
          <S.Lead>
            Se este e-mail já tiver conta (inclusive pelo Google), nenhum link é enviado: <a href={loginHref}>entre aqui</a> ou use
            “Esqueceu a senha?”.
          </S.Lead>
          <div style={{ marginTop: 24 }}>
            <Button variant="outline" href="/">
              Voltar para a loja
            </Button>
          </div>
        </S.Card>
      </S.Narrow>
    )
  }

  return (
    <S.Narrow>
      <S.Card>
        <S.Title>Criar nova conta</S.Title>
        <S.Lead>
          Já tem cadastro? <a href={loginHref}>Entre aqui</a>
        </S.Lead>

        <form action={action} noValidate>
          <input type="hidden" name="next" value={next} />

          <S.Section style={{ borderTop: 0, paddingTop: 0 }}>
            <C.StepHead style={{ marginBottom: 6 }}>
              <C.StepNumber aria-hidden="true">1</C.StepNumber>
              <div>
                <h2>Seus dados</h2>
                <p>Para a nota fiscal e para avisarmos sobre o envio.</p>
              </div>
            </C.StepHead>
            <C.Grid>
              <Input label="Nome completo" name="name" span={6} value={profile.name} onChange={set('name')} error={errors.name} autoComplete="name" placeholder="ex.: Maria Silva Santos" />
              <Input label="CPF" name="cpf" span={3} value={profile.cpf} onChange={(v) => set('cpf')(mask.cpf(v))} error={errors.cpf} inputMode="numeric" placeholder="000.000.000-00" />
              <Input label="Celular / WhatsApp" name="phone" span={3} value={profile.phone} onChange={(v) => set('phone')(mask.phone(v))} error={errors.phone} autoComplete="tel-national" inputMode="tel" placeholder="(37) 99999-9999" />
              <Input label="E-mail" name="email" type="email" span={6} value={profile.email} onChange={set('email')} error={errors.email} autoComplete="email" inputMode="email" placeholder="seu@email.com" />
            </C.Grid>
            <PasswordInput
              label="Crie uma senha *"
              value={password}
              onChange={setPassword}
              error={errors.password}
              hint="Mínimo 8 caracteres, com letras e números."
              autoComplete="new-password"
            />
          </S.Section>

          <S.Section>
            <C.StepHead style={{ marginBottom: 6 }}>
              <C.StepNumber aria-hidden="true">2</C.StepNumber>
              <div>
                <h2>Endereço de entrega (opcional)</h2>
                <p>Onde você quer receber seus pedidos. Dá para preencher depois, na primeira compra.</p>
              </div>
            </C.StepHead>
            <AddressFields value={address} onChange={setAddress} errors={errors} required={false} />
          </S.Section>

          <S.Section>
            <S.Check>
              <input type="checkbox" name="terms" />
              <span>
                Li e aceito a{' '}
                <a href="/privacidade" target="_blank" rel="noopener" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
                  Política de Privacidade
                </a>{' '}
                e autorizo o uso dos meus dados para processar e entregar meus pedidos.
              </span>
            </S.Check>
            {errors.terms && <S.FieldError>{errors.terms}</S.FieldError>}
            {state.error && (
              <S.Notice $tone="error" role="alert">
                {state.error}
              </S.Notice>
            )}
            {Object.keys(errors).length > 0 && (
              <S.Notice $tone="error" role="alert">
                Confira os campos destacados.
              </S.Notice>
            )}
            <Button as="button" type="submit" variant="primary" block disabled={pending} aria-busy={pending}>
              {pending ? 'Criando conta…' : 'Criar conta'}
            </Button>
          </S.Section>
        </form>

        <GoogleForm next={next} />
      </S.Card>
    </S.Narrow>
  )
}
