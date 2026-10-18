'use client'

/* /conta/nova-senha — chega pelo link de "Esqueceu a senha?" (já com a sessão de recuperação). */
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui'
import { updatePassword, type FormState } from '@/app/conta/actions'
import * as S from './Account.styles'
import { PasswordInput } from './fields'

const initial: FormState = {}

export function NewPasswordView() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, action, pending] = useActionState(updatePassword, initial)

  return (
    <S.Narrow style={{ maxWidth: 520 }}>
      <S.Card>
        <S.Title>Criar nova senha</S.Title>
        <S.Lead>Mínimo 8 caracteres, com letras e números.</S.Lead>
        <S.Form action={action} noValidate>
          {state.error && (
            <S.Notice $tone="error" role="alert">
              {state.error}
            </S.Notice>
          )}
          <PasswordInput label="Nova senha" value={password} onChange={setPassword} error={state.fields?.password} autoComplete="new-password" />
          <PasswordInput label="Repita a senha" name="confirm" value={confirm} onChange={setConfirm} error={state.fields?.confirm} autoComplete="new-password" />
          <Button as="button" type="submit" variant="primary" block disabled={pending} aria-busy={pending}>
            {pending ? 'Salvando…' : 'Salvar nova senha'}
          </Button>
        </S.Form>
      </S.Card>
    </S.Narrow>
  )
}
