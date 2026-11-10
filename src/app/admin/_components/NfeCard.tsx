'use client'

import { useState, useTransition, type ReactNode } from 'react'
import type { BlingConnectResult } from '@/server/nfe/connection'
import type { Order } from '@/server/orders'
import { connectBling, issueNfe, refreshNfe, releaseNfe } from '../actions'
import s from '../admin.module.css'
import { cents } from '../labels'
import { AlertIcon } from './Icons'
import { Spinner, SubmitButton } from './Pending'

type Props = {
  order: Pick<Order, 'id' | 'status' | 'items' | 'total_cents' | 'nfe_key' | 'nfe_status' | 'nfe_error' | 'nfe_danfe_url' | 'bling_nfe_id'>
  connected: boolean
  environment: 'test' | 'production'
  /** Emissão travada antes de o Bling devolver o id, há tempo suficiente para liberar (spec §9). */
  releasable: boolean
  /** Resultado da volta da autorização no Bling (parâmetro `bling` da URL). */
  result?: string
}

const FAILURES: Record<Exclude<BlingConnectResult, 'conectado'>, string> = {
  'sem-acesso-nfe': 'Conectado, mas o Bling negou acesso às notas: confira os escopos do aplicativo e o plano.',
  erro: 'Não foi possível concluir a conexão com o Bling. Tente de novo.',
  'estado-invalido': 'A autorização expirou ou não veio deste painel. Clique em Conectar Bling de novo.',
  recusado: 'A autorização foi recusada no Bling.',
  desligado: 'A integração com o Bling está desligada neste ambiente.',
}

/** Chave em blocos de 4, como no DANFE. */
const formatKey = (key: string) => key.replace(/(\d{4})(?=\d)/g, '$1 ')

/** Bloco “Nota fiscal” do pedido: emitir pelo Bling, acompanhar e mostrar a chave. */
export function NfeCard({ order, connected, environment, result, releasable }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const connectFailure = result && result in FAILURES ? FAILURES[result as keyof typeof FAILURES] : null
  const status = order.nfe_status
  const pieces = order.items.reduce((n, item) => n + item.quantity, 0)

  const run = (action: (orderId: string) => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null)
      const res = await action(order.id)
      if (!res.ok) setError(res.error ?? 'Erro inesperado')
    })

  const issue = () => {
    if (environment === 'production' && !window.confirm(`Emitir a NF-e de ${cents(order.total_cents)}? Uma nota autorizada só sai cancelando no Bling.`)) return
    run(issueNfe)
  }

  const release = () => {
    if (!window.confirm('Confira em Bling > Notas fiscais que não existe nota deste pedido. Liberar uma nova emissão?')) return
    run(releaseNfe)
  }

  const button = (label: string, onClick: () => void, secondary = false) => (
    <button className={secondary ? `${s.button} ${s.secondary}` : s.button} type="button" onClick={onClick} disabled={pending}>
      {pending && <Spinner />}
      {label}
    </button>
  )

  let body: ReactNode
  if (status === 'authorized' && order.nfe_key) {
    body = (
      <dl className={s.facts}>
        <div>
          <dt>Chave</dt>
          <dd>{formatKey(order.nfe_key)}</dd>
        </div>
        {order.nfe_danfe_url && (
          <div>
            <dt>DANFE</dt>
            <dd>
              <a href={order.nfe_danfe_url} target="_blank" rel="noopener noreferrer">
                Abrir DANFE
              </a>
            </dd>
          </div>
        )}
      </dl>
    )
  } else if (order.nfe_key) {
    body = (
      <dl className={s.facts}>
        <div>
          <dt>Chave (emitida fora do site)</dt>
          <dd>{formatKey(order.nfe_key)}</dd>
        </div>
      </dl>
    )
  } else if (!connected) {
    body = (
      <>
        <form action={connectBling}>
          <input type="hidden" name="orderId" value={order.id} />
          <SubmitButton pendingLabel="Abrindo o Bling…">Conectar Bling</SubmitButton>
        </form>
        <p className={s.cellSub}>Sem a conexão, emita a nota direto no Bling e cole a chave no bloco Envio.</p>
      </>
    )
  } else if (status === 'issuing' || status === 'processing') {
    body = (
      <>
        <p className={s.cellSub}>
          {order.bling_nfe_id ? 'Nota enviada à Sefaz, aguardando a autorização.' : 'Criando a nota no Bling…'}
        </p>
        <div className={s.inline}>
          {order.bling_nfe_id && button('Atualizar', () => run(refreshNfe))}
          {releasable && button('Liberar nova emissão', release, true)}
        </div>
      </>
    )
  } else if (status === 'blocked') {
    body = <p className={s.cellSub}>O site não tenta de novo esta nota. Resolva em Bling &gt; Notas fiscais.</p>
  } else if (order.status !== 'paid') {
    body = <p className={s.cellSub}>A nota é emitida depois que o pagamento é confirmado.</p>
  } else {
    body = (
      <>
        <p className={s.cellSub}>
          {pieces} {pieces === 1 ? 'peça' : 'peças'} · total {cents(order.total_cents)}
        </p>
        {button(status === 'rejected' ? 'Tentar de novo' : 'Emitir NF-e', issue)}
      </>
    )
  }

  const shownError = error ?? connectFailure ?? (status && status !== 'authorized' ? order.nfe_error : null)

  return (
    <section className={s.card}>
      <div className={s.cardHead}>
        <h2>Nota fiscal</h2>
        {environment === 'test' && <span className={s.cellSub}>Bling em teste: sem valor fiscal</span>}
      </div>
      <div className={`${s.cardBody} ${s.actions}`}>
        {body}
        {shownError && (
          <span className={s.status} data-tone="error" role="alert">
            <AlertIcon /> {shownError}
          </span>
        )}
      </div>
    </section>
  )
}
