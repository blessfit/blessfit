'use client'

/*
 * Indicadores de carregamento do painel:
 * - SubmitButton: botão de formulário que mostra o spinner enquanto a ação (ou a busca) roda;
 * - LinkSpinner: dentro de um <Link>, aparece enquanto a navegação daquele link carrega.
 */
import { useLinkStatus } from 'next/link'
import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import s from '../admin.module.css'

export const Spinner = () => <span className={s.spinner} aria-hidden="true" />

export function SubmitButton({
  children,
  className = s.button,
  pendingLabel,
  name,
  value,
}: {
  children: ReactNode
  className?: string
  /** Texto enquanto carrega (padrão: o mesmo do botão). */
  pendingLabel?: string
  name?: string
  value?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button className={className} type="submit" name={name} value={value} disabled={pending} aria-busy={pending}>
      {pending && <Spinner />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  )
}

export function LinkSpinner() {
  const { pending } = useLinkStatus()
  return pending ? <Spinner /> : null
}
