'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createCoupon, setCouponActive, updateCoupon, type ActionResult } from '../actions'
import s from '../admin.module.css'
import { AlertIcon } from './Icons'
import { Spinner } from './Pending'

/** Cupom como a página manda (já com usos e situação calculados no servidor). */
export type CouponView = {
  code: string
  percent: number
  maxUses: number | null
  firstPurchaseOnly: boolean
  startsAt: string | null
  endsAt: string | null
  active: boolean
  uses: number
  state: 'active' | 'inactive' | 'scheduled' | 'expired' | 'exhausted'
}

type Form = { percent: string; maxUses: string; startsAt: string; endsAt: string; firstPurchaseOnly: boolean }

const EMPTY: Form = { percent: '10', maxUses: '', startsAt: '', endsAt: '', firstPurchaseOnly: true }

const STATE: Record<CouponView['state'], { label: string; badge?: string }> = {
  active: { label: 'Ativo', badge: 'paid' },
  scheduled: { label: 'Agendado', badge: 'shipped' },
  exhausted: { label: 'Esgotado', badge: 'review' },
  expired: { label: 'Vencido', badge: 'canceled' },
  inactive: { label: 'Desligado' },
}

/** ISO → valor do `datetime-local` no horário de Brasília (UTC−3, sem horário de verão). */
const toInput = (iso: string | null) => (iso ? new Date(Date.parse(iso) - 3 * 3600_000).toISOString().slice(0, 16) : '')

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

function validity(c: CouponView) {
  if (c.startsAt && c.endsAt) return `${formatDate(c.startsAt)} até ${formatDate(c.endsAt)}`
  if (c.startsAt) return `A partir de ${formatDate(c.startsAt)}`
  if (c.endsAt) return `Até ${formatDate(c.endsAt)}`
  return 'Sem prazo'
}

/** Campos comuns de criar e editar. */
function Fields({ form, set }: { form: Form; set: <K extends keyof Form>(k: K, v: Form[K]) => void }) {
  return (
    <>
      <label className={s.label}>
        Desconto (%)
        <input className={s.input} inputMode="numeric" value={form.percent} onChange={(e) => set('percent', e.target.value)} />
      </label>
      <label className={s.label}>
        Limite de usos
        <input className={s.input} inputMode="numeric" placeholder="sem limite" value={form.maxUses} onChange={(e) => set('maxUses', e.target.value)} />
      </label>
      <label className={s.label}>
        Começa em
        <input className={s.input} type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
      </label>
      <label className={s.label}>
        Termina em
        <input className={s.input} type="datetime-local" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} />
      </label>
      <label className={s.switch}>
        <input type="checkbox" checked={form.firstPurchaseOnly} onChange={(e) => set('firstPurchaseOnly', e.target.checked)} />
        <i />
        Só na primeira compra
      </label>
    </>
  )
}

function useAction() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const run = (action: () => Promise<ActionResult>, onDone?: () => void) =>
    startTransition(async () => {
      setError(null)
      const result = await action()
      if (!result.ok) return setError(result.error)
      onDone?.()
      router.refresh()
    })
  return { error, pending, run }
}

const ErrorText = ({ error }: { error: string | null }) =>
  error ? (
    <span className={s.status} data-tone="error" role="alert">
      <AlertIcon /> {error}
    </span>
  ) : null

/** "Novo cupom", no topo da página. */
export function NewCoupon() {
  const [code, setCode] = useState('')
  const [form, setForm] = useState(EMPTY)
  const { error, pending, run } = useAction()
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <form
      className={s.couponForm}
      onSubmit={(e) => {
        e.preventDefault()
        run(
          () => createCoupon(code, form),
          () => {
            setCode('')
            setForm(EMPTY)
          },
        )
      }}
    >
      <label className={s.label}>
        Código
        <input
          className={s.input}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20))}
          placeholder="BLESS10"
          autoComplete="off"
          required
        />
      </label>
      <Fields form={form} set={set} />
      <div className={s.couponFormFoot}>
        <button className={s.button} type="submit" disabled={pending || code.length < 3}>
          {pending && <Spinner />}
          {pending ? 'Criando…' : 'Criar cupom'}
        </button>
        <ErrorText error={error} />
      </div>
    </form>
  )
}

/** Uma linha da lista, com "Editar" (tudo menos o código) e "Desligar / Religar". */
export function CouponRow({ coupon }: { coupon: CouponView }) {
  const [editing, setEditing] = useState(false)
  const initial: Form = {
    percent: String(coupon.percent),
    maxUses: coupon.maxUses === null ? '' : String(coupon.maxUses),
    startsAt: toInput(coupon.startsAt),
    endsAt: toInput(coupon.endsAt),
    firstPurchaseOnly: coupon.firstPurchaseOnly,
  }
  const [form, setForm] = useState(initial)
  const { error, pending, run } = useAction()
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const over = coupon.maxUses !== null && coupon.uses > coupon.maxUses
  const state = STATE[coupon.state]

  return (
    <>
      <div className={s.couponRow}>
        <span>{coupon.code}</span>
        <span>{coupon.percent}% OFF</span>
        <span>
          {coupon.maxUses === null ? `${coupon.uses} usos` : `${coupon.uses} / ${coupon.maxUses} usos`}
          {over && (
            <span className={s.cellSub} style={{ color: 'var(--amber)' }}>
              {coupon.uses - coupon.maxUses!} acima do limite
            </span>
          )}
        </span>
        <span>
          {validity(coupon)}
          <span className={s.cellSub}>{coupon.firstPurchaseOnly ? 'Só na primeira compra' : 'Vale em qualquer compra'}</span>
        </span>
        <span className={s.badge} data-status={state.badge}>
          {state.label}
        </span>
        <div className={s.couponActions}>
          <button
            className={`${s.button} ${s.secondary}`}
            type="button"
            onClick={() => {
              setForm(initial)
              setEditing((v) => !v)
            }}
          >
            {editing ? 'Fechar' : 'Editar'}
          </button>
          <button
            className={`${s.button} ${s.secondary}`}
            type="button"
            disabled={pending}
            onClick={() => run(() => setCouponActive(coupon.code, !coupon.active))}
          >
            {pending && !editing && <Spinner />}
            {coupon.active ? 'Desligar' : 'Religar'}
          </button>
        </div>
      </div>
      {!editing && error && (
        <div className={s.couponForm} data-inline="true">
          <ErrorText error={error} />
        </div>
      )}
      {editing && (
        <form
          className={s.couponForm}
          data-inline="true"
          onSubmit={(e) => {
            e.preventDefault()
            run(() => updateCoupon(coupon.code, form), () => setEditing(false))
          }}
        >
          <Fields form={form} set={set} />
          <div className={s.couponFormFoot}>
            <button className={s.button} type="submit" disabled={pending}>
              {pending && <Spinner />}
              {pending ? 'Salvando…' : 'Salvar'}
            </button>
            <ErrorText error={error} />
          </div>
        </form>
      )}
    </>
  )
}
