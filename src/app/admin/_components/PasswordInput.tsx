'use client'

import { useState } from 'react'
import s from '../admin.module.css'
import { EyeIcon, EyeOffIcon } from './Icons'

/** Campo de senha com botão para mostrar/ocultar o que foi digitado. */
export function PasswordInput() {
  const [visible, setVisible] = useState(false)
  return (
    <span className={s.password}>
      <input
        className={s.input}
        name="password"
        type={visible ? 'text' : 'password'}
        autoComplete="current-password"
        required
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </span>
  )
}
