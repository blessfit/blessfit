'use client'

import { useState, useTransition } from 'react'
import type { Order } from '@/server/orders'
import { cancelShippingLabel, createShippingLabel, printShippingLabel } from '../actions'
import s from '../admin.module.css'
import { cents } from '../labels'
import { AlertIcon } from './Icons'
import { Spinner } from './Pending'

type Props = {
  order: Pick<
    Order,
    'id' | 'status' | 'shipping' | 'shipping_address' | 'nfe_key' | 'shipping_status' | 'shipping_error' | 'tracking_code' | 'label_cost_cents'
  >
  /** Saldo da carteira do Melhor Envio (null = não deu para consultar). */
  balanceCents: number | null
}

/** Bloco “Envio” do pedido: endereço, frete cobrado e a etiqueta do Melhor Envio (NF-e → gerar → imprimir). */
export function ShippingCard({ order, balanceCents }: Props) {
  const [nfeKey, setNfeKey] = useState(order.nfe_key ?? '')
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{ quotedCents: number; currentCents: number } | null>(null)
  const [pending, startTransition] = useTransition()
  const { shipping, shipping_address: address } = order

  if (!shipping || !address) {
    return (
      <section className={s.card}>
        <div className={s.cardHead}>
          <h2>Envio</h2>
        </div>
        <p className={`${s.cardBody} ${s.cellSub}`}>Pedido sem frete cadastrado no site: combine o envio com o cliente.</p>
      </section>
    )
  }

  const generate = (acceptCents?: number) =>
    startTransition(async () => {
      setError(null)
      const result = await createShippingLabel(order.id, nfeKey, acceptCents)
      setConfirm(!result.ok && 'confirm' in result ? result.confirm : null)
      if (!result.ok) setError(result.error)
    })

  const print = () => {
    // abre a aba já no clique (depois do await o navegador bloquearia o pop-up)
    const tab = window.open('', '_blank')
    startTransition(async () => {
      const result = await printShippingLabel(order.id)
      if (result.ok && tab) tab.location.href = result.url
      else {
        tab?.close()
        setError(result.ok ? 'Libere os pop-ups para abrir a etiqueta' : result.error)
      }
    })
  }

  const cancel = () => {
    if (!window.confirm('Cancelar a etiqueta? O valor volta para o saldo do Melhor Envio.')) return
    startTransition(async () => {
      const result = await cancelShippingLabel(order.id)
      setError(result.ok ? null : result.error)
    })
  }

  const ready = order.shipping_status === 'ready'
  const canGenerate = order.status === 'paid' && !ready && order.shipping_status !== 'buying'

  return (
    <section className={s.card}>
      <div className={s.cardHead}>
        <h2>Envio</h2>
        {balanceCents !== null && <span className={s.cellSub}>Saldo ME: {cents(balanceCents)}</span>}
      </div>
      <div className={`${s.cardBody} ${s.actions}`}>
        <dl className={s.facts}>
          <div>
            <dt>Frete</dt>
            <dd>
              {shipping.carrier} {shipping.name} · {shipping.priceCents === 0 ? 'grátis' : cents(shipping.priceCents)}
              {shipping.source === 'fallback' && ' (tabela de contingência)'}
            </dd>
          </div>
          <div>
            <dt>Prazo informado</dt>
            <dd>
              {shipping.days.min} a {shipping.days.max} dias úteis
            </dd>
          </div>
          <div>
            <dt>Endereço</dt>
            <dd>
              {address.street}, {address.number}
              {address.complement ? ` — ${address.complement}` : ''}
              <br />
              {address.district} · {address.city}/{address.uf} · CEP {address.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
            </dd>
          </div>
          <div>
            <dt>Pacote</dt>
            <dd>
              {shipping.parcel.weightG} g · {shipping.parcel.lengthCm}×{shipping.parcel.widthCm}×{shipping.parcel.heightCm} cm
            </dd>
          </div>
          {order.label_cost_cents !== null && (
            <div>
              <dt>Custo da etiqueta</dt>
              <dd>{cents(order.label_cost_cents)}</dd>
            </div>
          )}
          {order.tracking_code && (
            <div>
              <dt>Rastreio</dt>
              <dd>{order.tracking_code}</dd>
            </div>
          )}
        </dl>

        {canGenerate && (
          <>
            <label>
              <span className={s.label}>Chave da NF-e (44 dígitos)</span>
              <input
                className={s.input}
                inputMode="numeric"
                value={nfeKey}
                onChange={(e) => setNfeKey(e.target.value)}
                placeholder="Emita a nota e cole a chave aqui"
              />
            </label>
            {confirm ? (
              <p className={s.alert}>
                <AlertIcon />
                <span>
                  A etiqueta custa {cents(confirm.currentCents)}, mas a cotação do cliente foi {cents(confirm.quotedCents)}.{' '}
                  <button className={s.button} type="button" onClick={() => generate(confirm.currentCents)} disabled={pending}>
                    Gerar mesmo assim
                  </button>
                </span>
              </p>
            ) : (
              <button className={s.button} type="button" onClick={() => generate()} disabled={pending || !nfeKey.trim()}>
                {pending && <Spinner />}
                {pending ? 'Gerando…' : order.shipping_status === 'failed' ? 'Tentar de novo' : 'Gerar etiqueta'}
              </button>
            )}
          </>
        )}

        {order.shipping_status === 'buying' && <p className={s.cellSub}>Etiqueta sendo gerada… recarregue em instantes.</p>}

        {ready && (
          <div className={s.inline}>
            <button className={s.button} type="button" onClick={print} disabled={pending}>
              {pending && <Spinner />}
              Imprimir etiqueta
            </button>
            {order.status === 'paid' && (
              <button className={`${s.button} ${s.secondary}`} type="button" onClick={cancel} disabled={pending}>
                Cancelar etiqueta
              </button>
            )}
          </div>
        )}

        {(error ?? (order.shipping_status === 'failed' && order.shipping_error)) && (
          <span className={s.status} data-tone="error" role="alert">
            <AlertIcon /> {error ?? order.shipping_error}
          </span>
        )}
      </div>
    </section>
  )
}
