'use client'

import { useState } from 'react'
import s from '../admin.module.css'
import { CheckIcon, LinkIcon } from './Icons'

/** Copia um link (ex.: o da pesquisa) para colar no WhatsApp ou no Instagram. */
export function CopyLinkButton({ url, label = 'Copiar link' }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link:', url)
    }
  }

  return (
    <button className={`${s.button} ${s.secondary}`} type="button" onClick={copy}>
      {copied ? <CheckIcon /> : <LinkIcon />}
      {copied ? 'Link copiado!' : label}
    </button>
  )
}
