'use client'

/*
 * /conta — pedidos, dados e endereço do cliente logado; sair e excluir a conta.
 */
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui'
import { deleteAccount, saveProfile, signOut, type FormState } from '@/app/conta/actions'
import { EMPTY_ADDRESS, mask, type AddressForm } from '@/lib/customer'
import { formatBRL } from '@/lib/price'
import type { Customer, CustomerOrder } from '@/server/customers'
import * as C from '../Cart/Cart.styles'
import * as S from './Account.styles'
import { AddressFields, Input } from './fields'

const STATUS: Record<string, { label: string; tone: 'ok' | 'wait' | 'off' }> = {
  pending: { label: 'Aguardando pagamento', tone: 'wait' },
  review: { label: 'Em análise', tone: 'wait' },
  paid: { label: 'Pago', tone: 'ok' },
  shipped: { label: 'Enviado', tone: 'ok' },
  delivered: { label: 'Entregue', tone: 'ok' },
  canceled: { label: 'Cancelado', tone: 'off' },
}

// fuso fixo: a data sai igual no servidor (UTC) e no navegador
const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })

const initial: FormState = {}

function toForm(address: Customer['address']): AddressForm {
  if (!address) return EMPTY_ADDRESS
  return { ...address, cep: mask.cep(address.cep), complement: address.complement ?? '' }
}

export function AccountView({
  email,
  customer,
  orders,
  notice,
}: {
  email: string
  customer: Customer | null
  orders: CustomerOrder[]
  notice?: string
}) {
  const [profile, setProfile] = useState({
    name: customer?.name ?? '',
    cpf: mask.cpf(customer?.cpf ?? ''),
    phone: mask.phone(customer?.phone ?? ''),
  })
  const [address, setAddress] = useState(() => toForm(customer?.address ?? null))
  const [state, action, pending] = useActionState(saveProfile, initial)
  const [deleteState, deleteAction, deleting] = useActionState(deleteAccount, initial)
  const errors = state.fields ?? {}
  const set = (key: keyof typeof profile) => (value: string) => setProfile((p) => ({ ...p, [key]: value }))
  const firstName = profile.name.trim().split(/\s+/)[0]

  return (
    <C.Layout>
      <C.Steps>
        <S.Card aria-labelledby="pedidos-titulo">
          <S.Subtitle id="pedidos-titulo">Meus pedidos</S.Subtitle>
          {orders.length === 0 ? (
            <S.Lead>
              Você ainda não tem pedidos. <a href="/#conjuntos">Ver produtos</a>
            </S.Lead>
          ) : (
            <S.Orders>
              {orders.map((order) => {
                const status = STATUS[order.status] ?? { label: order.status, tone: 'wait' as const }
                const pieces = order.items.reduce((n, item) => n + item.quantity, 0)
                return (
                  <li key={order.id}>
                    <a href={`/pedido/${order.id}`}>
                      <strong>Pedido #{order.id.slice(0, 8).toUpperCase()}</strong>
                      <S.Status $tone={status.tone}>{status.label}</S.Status>
                      <span>
                        {date.format(new Date(order.created_at))} · {pieces === 1 ? '1 peça' : `${pieces} peças`}
                      </span>
                      <span style={{ justifySelf: 'end' }}>{formatBRL(order.total_cents / 100)}</span>
                    </a>
                  </li>
                )
              })}
            </S.Orders>
          )}
        </S.Card>

        <S.Card aria-labelledby="dados-titulo">
          <S.Subtitle id="dados-titulo">Meus dados</S.Subtitle>
          <S.Lead>Usados para preencher o checkout. O endereço é atualizado a cada compra.</S.Lead>
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
        </S.Card>
      </C.Steps>

      <C.Aside aria-label="Sua conta">
        <S.Subtitle>{firstName ? `Olá, ${firstName}!` : 'Olá!'}</S.Subtitle>
        <S.Lead style={{ marginTop: 4, wordBreak: 'break-all' }}>{email}</S.Lead>
        {notice && (
          <S.Notice role="status" style={{ marginTop: 16 }}>
            {notice}
          </S.Notice>
        )}
        <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
          <Button variant="primary" block href="/#conjuntos">
            Continuar comprando
          </Button>
          <form action={signOut}>
            <Button as="button" type="submit" variant="outline" block>
              Sair da conta
            </Button>
          </form>
        </div>

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
      </C.Aside>
    </C.Layout>
  )
}
