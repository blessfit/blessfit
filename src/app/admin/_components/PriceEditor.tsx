'use client'

import { useState, useTransition } from 'react'
import { savePrices } from '../actions'
import s from '../admin.module.css'
import { AlertIcon, CheckIcon } from './Icons'

type Values = { price: string; pix: string; compareAt: string; active: boolean }

type Props = { productId: string; name: string; meta: string; photo?: string; initial: Values }

/** Uma linha da tela de preços: cartão, Pix, preço “de” e à venda, salvando sem recarregar. */
export function PriceEditor({ productId, name, meta, photo, initial }: Props) {
  const [values, setValues] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const dirty = (Object.keys(values) as (keyof Values)[]).some((k) => values[k] !== saved[k])

  const set = <K extends keyof Values>(k: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [k]: value }))
    setResult(null)
  }

  const save = () =>
    startTransition(async () => {
      const response = await savePrices(productId, values)
      if (response.ok) {
        setSaved(values)
        setResult({ ok: true, message: 'Salvo' })
      } else {
        setResult({ ok: false, message: response.error })
      }
    })

  const money = (k: 'price' | 'pix' | 'compareAt', label: string) => (
    <label>
      <span className={s.mobileLabel}>{label}</span>
      <span className={s.money}>
        <span>R$</span>
        <input
          className={s.input}
          inputMode="decimal"
          value={values[k]}
          placeholder={k === 'compareAt' ? 'opcional' : undefined}
          onChange={(e) => set(k, e.target.value)}
          aria-label={`${label} de ${name}`}
        />
      </span>
    </label>
  )

  return (
    <div className={s.priceRow} data-inactive={!values.active}>
      {photo ? <img className={`${s.thumb} ${s.thumbSm}`} src={photo} alt="" /> : <span />}
      <div>
        <span className={s.cellMain}>{name}</span>
        <span className={s.cellSub}>{meta}</span>
      </div>
      {money('price', 'Cartão')}
      {money('pix', 'Pix')}
      {money('compareAt', 'Preço “de”')}
      <label className={s.switch}>
        <input type="checkbox" checked={values.active} onChange={(e) => set('active', e.target.checked)} />
        <i />
        {values.active ? 'À venda' : 'Oculto'}
      </label>
      <div className={s.priceSave}>
        {result?.ok && !dirty ? (
          <span className={s.status} data-tone="ok" role="status">
            <CheckIcon /> {result.message}
          </span>
        ) : (
          <button className={`${s.button} ${dirty ? '' : s.secondary}`} type="button" onClick={save} disabled={!dirty || pending}>
            {pending ? 'Salvando…' : 'Salvar'}
          </button>
        )}
        {result && !result.ok && (
          <span className={s.status} data-tone="error" role="alert">
            <AlertIcon /> {result.message}
          </span>
        )}
      </div>
    </div>
  )
}
