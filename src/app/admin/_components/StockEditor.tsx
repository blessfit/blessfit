'use client'

import { useState, useTransition } from 'react'
import { saveStock } from '../actions'
import s from '../admin.module.css'
import { AlertIcon, CheckIcon } from './Icons'

export type StockColor = { name: string; hex: string; photo?: string }

type Props = {
  productId: string
  sizes: string[]
  colors: StockColor[]
  /** Quantidade por `${cor}|${tamanho}`; null = sem controle. */
  initial: Record<string, number | null>
  lowStock: number
}

const key = (color: string, size: string) => `${color}|${size}`

/** Grade de estoque de um produto (cor × tamanho) com +/− e salvamento sem recarregar a página. */
export function StockEditor({ productId, sizes, colors, initial, lowStock }: Props) {
  const [values, setValues] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const dirty = Object.keys(values).some((k) => values[k] !== saved[k])

  const set = (k: string, quantity: number | null) => {
    setValues((current) => ({ ...current, [k]: quantity === null ? null : Math.max(0, quantity) }))
    setResult(null)
  }

  /** +1 / −1 sobre o valor atual (sem controle → começa em 0). */
  const bump = (k: string, delta: number) => {
    setValues((current) => ({ ...current, [k]: Math.max(0, (current[k] ?? 0) + delta) }))
    setResult(null)
  }

  const save = () =>
    startTransition(async () => {
      const rows = colors.flatMap((color) =>
        sizes.map((size) => ({ color: color.name, size, quantity: values[key(color.name, size)] ?? null })),
      )
      const response = await saveStock(productId, rows)
      if (response.ok) {
        setSaved(values)
        setResult({ ok: true, message: 'Estoque salvo' })
      } else {
        setResult({ ok: false, message: response.error })
      }
    })

  return (
    <>
      <div className={s.gridWrap}>
        <table className={s.stockGrid}>
          <thead>
            <tr>
              <th scope="col" className={s.srOnly}>
                Cor
              </th>
              {sizes.map((size) => (
                <th key={size} scope="col">
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map((color) => (
              <tr key={color.name}>
                <th scope="row">
                  <span className={s.colorCell}>
                    {color.photo && <img className={`${s.thumb} ${s.thumbSm}`} src={color.photo} alt="" />}
                    <span className={s.dot} style={{ background: color.hex }} />
                    {color.name}
                  </span>
                </th>
                {sizes.map((size) => {
                  const k = key(color.name, size)
                  const quantity = values[k] ?? null
                  const level = quantity === null ? undefined : quantity === 0 ? 'out' : quantity <= lowStock ? 'low' : undefined
                  return (
                    <td key={size}>
                      <span className={s.stepper} data-level={level}>
                        <button
                          type="button"
                          onClick={() => bump(k, -1)}
                          aria-label={`Diminuir ${color.name} ${size}`}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          placeholder="—"
                          value={quantity ?? ''}
                          onChange={(e) => set(k, e.target.value === '' ? null : Math.floor(Number(e.target.value)))}
                          aria-label={`Estoque ${color.name} ${size}`}
                        />
                        <button
                          type="button"
                          onClick={() => bump(k, 1)}
                          aria-label={`Aumentar ${color.name} ${size}`}
                        >
                          +
                        </button>
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={s.saveBar}>
        {result ? (
          <span className={s.status} data-tone={result.ok ? 'ok' : 'error'} role="status">
            {result.ok ? <CheckIcon /> : <AlertIcon />} {result.message}
          </span>
        ) : (
          dirty && <span className={s.status}>Alterações não salvas</span>
        )}
        <button className={s.button} type="button" onClick={save} disabled={!dirty || pending}>
          {pending ? 'Salvando…' : 'Salvar estoque'}
        </button>
      </div>
    </>
  )
}
