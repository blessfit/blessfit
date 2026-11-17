/* Textos e contagem regressiva da Black Friday, usados pelo banner e pela barra do topo. */
import { useEffect, useState } from 'react'
import { BLOUSE_TIERS, MAX_BLOUSE_PERCENT } from '@/lib/campaign'

/** Tempo até `endsAt` em dias/horas/min/seg. null antes de montar (o servidor não sabe a hora do cliente). */
export function useTimeLeft(endsAt: string | null) {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    if (!endsAt) return
    const end = Date.parse(endsAt)
    const tick = () => setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [endsAt])
  if (left === null) return null
  return { d: Math.floor(left / 86400), h: Math.floor((left % 86400) / 3600), m: Math.floor((left % 3600) / 60), s: left % 60 }
}

/** "4 ou mais" no último degrau, "2 blusas" nos outros. */
export const tierLabel = (i: number) =>
  i === BLOUSE_TIERS.length - 1 ? `${BLOUSE_TIERS[i].min} ou mais` : `${BLOUSE_TIERS[i].min} blusas`

/** Texto curto da promoção, para a barra do topo. */
export const PROMO_SHORT = `Leve ${BLOUSE_TIERS[0].min} blusas e ganhe ${BLOUSE_TIERS[0].percent}% · ${BLOUSE_TIERS[BLOUSE_TIERS.length - 1].min} ou mais ganham ${MAX_BLOUSE_PERCENT}%`
