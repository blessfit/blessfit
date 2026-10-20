'use client'

/*
 * /conta/dados — nome, CPF, celular e endereço do cliente logado; excluir a conta.
 */
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui'
import { deleteAccount, saveProfile, type FormState } from '@/app/conta/actions'
import { EMPTY_ADDRESS, mask, type AddressForm } from '@/lib/customer'
import type { Customer } from '@/server/customers'
import * as C from '../Cart/Cart.styles'
import * as S from './Account.styles'
import { AddressFields, Input, useScrollToError } from './fields'

const initial: FormState = {}

function toForm(address: Customer['address']): AddressForm {
  if (!address) return EMPTY_ADDRESS
  return { ...address, cep: mask.cep(address.cep), complement: address.complement ?? '' }
}

export function ProfileView({ email, customer, notice }: { email: string; customer: Customer | null; notice?: string }) {
  const [profile, setProfile] = useState({
    name: customer?.name ?? '',
    cpf: mask.cpf(customer?.cpf ?? ''),
    phone: mask.phone(customer?.phone ?? ''),
  })
  const [address, setAddress] = useState(() => toForm(customer?.address ?? null))
  const [state, action, pending] = useActionState(saveProfile, initial)
  const [deleteState, deleteAction, deleting] = useActionState(deleteAccount, initial)
  const errors = state.fields ?? {}
  useScrollToError(state.fields)
  const set = (key: keyof typeof profile) => (value: string) => setProfile((p) => ({ ...p, [key]: value }))

  return (
    <S.Card aria-labelledby="dados-titulo">
      <S.Subtitle id="dados-titulo">Meus dados</S.Subtitle>
      <S.Lead>Usados para preencher o checkout. O endereço é atualizado a cada compra.</S.Lead>
      {notice && (
        <S.Notice role="status" style={{ marginTop: 16 }}>
          {notice}
        </S.Notice>
      )}
      <S.Form action={action} noValidate>
        <C.Grid>
          <Input label="Nome completo" name="name" span={6} value={profile.name} onChange={set('name')} error={errors.name} autoComplete="name" />
          <Input label="CPF" name="cpf" span={3} value={profile.cpf} onChange={(v) => set('cpf')(mask.cpf(v))} error={errors.cpf} inputMode="numeric" placeholder="000.000.000-00" />
          <Input label="Celular / WhatsApp" name="phone" span={3} value={profile.phone} onChange={(v) => set('phone')(mask.phone(v))} error={errors.phone} autoComplete="tel-national" inputMode="tel" />
          <Input label="E-mail" name="email-view" span={6} required={false} value={email} readOnly />
        </C.Grid>
        <S.Subtitle as="h3" style={{ fontSize: 15, marginTop: 8 }}>
          Endereço de entrega
        </S.Subtitle>
        <AddressFields value={address} onChange={setAddress} errors={errors} required={false} />
        {state.ok && !pending && <S.Notice role="status">Dados salvos.</S.Notice>}
        {Object.keys(errors).length > 0 && (
          <S.Notice $tone="error" role="alert">
            Confira os campos destacados.
          </S.Notice>
        )}
        <div>
          <Button as="button" type="submit" variant="primary" disabled={pending} aria-busy={pending}>
            {pending ? 'Salvando…' : 'Salvar dados'}
          </Button>
        </div>
      </S.Form>

      <S.Danger>
        <summary>Excluir minha conta</summary>
        <form action={deleteAction}>
          <span>
            Seus dados de cadastro são apagados. Os pedidos já feitos ficam guardados pela loja por obrigação fiscal. Digite{' '}
            <strong>EXCLUIR</strong> para confirmar.
          </span>
          <C.Field>
            <input name="confirm" autoComplete="off" aria-label="Digite EXCLUIR para confirmar" />
          </C.Field>
          {deleteState.error && <S.FieldError role="alert">{deleteState.error}</S.FieldError>}
          <Button as="button" type="submit" variant="outline" size="sm" disabled={deleting}>
            {deleting ? 'Excluindo…' : 'Excluir conta'}
          </Button>
        </form>
      </S.Danger>
    </S.Card>
  )
}
