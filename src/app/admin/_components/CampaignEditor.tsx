'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setCampaign } from '../actions'
import s from '../admin.module.css'
import { AlertIcon, CheckIcon } from './Icons'
import { Spinner } from './Pending'

/** ISO → valor do `datetime-local` no horário de Brasília (UTC−3, sem horário de verão). */
const toInput = (iso: string | null) => (iso ? new Date(Date.parse(iso) - 3 * 3600_000).toISOString().slice(0, 16) : '')

/** Liga/desliga a Black Friday e o fim automático. */
export function CampaignEditor({ blackFriday, endsAt }: { blackFriday: boolean; endsAt: string | null }) {
  const router = useRouter()
  const [on, setOn] = useState(blackFriday)
  const [end, setEnd] = useState(toInput(endsAt))
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const dirty = on !== blackFriday || end !== toInput(endsAt)

  const save = () =>
    startTransition(async () => {
      setResult(null)
      const r = await setCampaign({ blackFriday: on, endsAt: end })
      if (!r.ok) return setResult({ ok: false, text: r.error })
      setResult({ ok: true, text: on ? 'Black Friday ligada. A loja muda em até 1 minuto.' : 'Black Friday desligada. A loja volta ao normal em até 1 minuto.' })
      router.refresh()
    })

  return (
    <form
      className={s.cardBody}
      style={{ display: 'grid', gap: 18, maxWidth: 520 }}
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <label className={s.switch}>
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
        <i />
        Black Friday ligada
      </label>

      <label className={s.label}>
        Termina em (horário de Brasília)
        <input className={s.input} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        <span className={s.couponHint}>Vazio = fica ligada até você desligar aqui. Com data, desliga sozinha e mostra a contagem regressiva.</span>
      </label>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <button className={s.button} type="submit" disabled={pending || !dirty}>
          {pending && <Spinner />}
          {pending ? 'Salvando…' : 'Salvar'}
        </button>
        {result && (
          <span className={s.status} data-tone={result.ok ? 'ok' : 'error'} role={result.ok ? 'status' : 'alert'}>
            {result.ok ? <CheckIcon /> : <AlertIcon />} {result.text}
          </span>
        )}
      </div>
    </form>
  )
}
