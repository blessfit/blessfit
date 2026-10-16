'use client'

import { useState } from 'react'
import s from '../admin.module.css'
import { AlertIcon, DownloadIcon } from './Icons'
import { Spinner } from './Pending'

/** Baixa uma planilha do painel (padrão: estoque, preços e vendas), com loading enquanto o arquivo é gerado. */
export function ExportButton({ href = '/admin/exportar', fallbackName = 'estoque-blessfit.xlsx' }: { href?: string; fallbackName?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')

  const download = async () => {
    setState('loading')
    try {
      const res = await fetch(href)
      if (!res.ok || !res.headers.get('content-type')?.includes('spreadsheet')) throw new Error(String(res.status))
      const name = decodeURIComponent(res.headers.get('content-disposition')?.match(/filename\*=UTF-8''([^;]+)/)?.[1] ?? fallbackName)
      const url = URL.createObjectURL(await res.blob())
      const link = Object.assign(document.createElement('a'), { href: url, download: name })
      link.click()
      URL.revokeObjectURL(url)
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return (
    <span className={s.exportWrap}>
      <button className={`${s.button} ${s.secondary}`} type="button" onClick={download} disabled={state === 'loading'} aria-busy={state === 'loading'}>
        {state === 'loading' ? <Spinner /> : <DownloadIcon />}
        {state === 'loading' ? 'Gerando planilha…' : 'Exportar Excel'}
      </button>
      {state === 'error' && (
        <span className={s.status} data-tone="error" role="alert">
          <AlertIcon /> Não foi possível gerar a planilha
        </span>
      )}
    </span>
  )
}
