'use client'

/* Campos dos formulários da conta, no mesmo visual do checkout (Cart.styles). */
import { useEffect, useState, type ReactNode } from 'react'
import { Eye } from '@/components/ui'
import { mask, UFS, type AddressForm } from '@/lib/customer'
import { normalizeCep } from '@/lib/documents'
import * as C from '../Cart/Cart.styles'
import * as S from './Account.styles'

/** Quando o envio volta com erro, rola até o primeiro campo marcado (aria-invalid), como no checkout. */
export function useScrollToError(fields: Record<string, string> | undefined) {
  useEffect(() => {
    if (!fields || Object.keys(fields).length === 0) return
    document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [fields])
}

type InputProps = {
  label: ReactNode
  name: string
  value: string
  onChange?: (value: string) => void
  error?: string
  span?: number
  spanSm?: number
  required?: boolean
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  readOnly?: boolean
}

export function Input({ label, name, value, onChange, error, span, spanSm, required = true, ...input }: InputProps) {
  return (
    <C.Field $span={span} $spanSm={spanSm} data-invalid={Boolean(error)}>
      <span>
        {label} {required && <C.Required>*</C.Required>}
      </span>
      <input name={name} value={value} onChange={(e) => onChange?.(e.target.value)} aria-invalid={Boolean(error)} {...input} />
      {error && <small>{error}</small>}
    </C.Field>
  )
}

export function PasswordInput({
  label = 'Senha',
  name = 'password',
  value,
  onChange,
  error,
  aside,
  hint,
  autoComplete = 'current-password',
}: {
  label?: string
  name?: string
  value: string
  onChange: (value: string) => void
  error?: string
  /** Link ao lado do rótulo ("Esqueceu a senha?"). */
  aside?: ReactNode
  hint?: string
  autoComplete?: 'current-password' | 'new-password'
}) {
  const [visible, setVisible] = useState(false)
  return (
    <C.Field data-invalid={Boolean(error)}>
      <S.LabelRow>
        <span>{label}</span>
        {aside}
      </S.LabelRow>
      <S.PasswordBox>
        <input
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          required
        />
        <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Esconder senha' : 'Mostrar senha'} aria-pressed={visible}>
          <Eye />
        </button>
      </S.PasswordBox>
      {error ? <small>{error}</small> : hint && <S.Hint>{hint}</S.Hint>}
    </C.Field>
  )
}

/** Endereço com preenchimento pelo CEP (ViaCEP). `required=false`: tudo opcional enquanto o CEP estiver vazio. */
export function AddressFields({
  value,
  onChange,
  errors = {},
  required = true,
}: {
  value: AddressForm
  onChange: (next: (current: AddressForm) => AddressForm) => void
  errors?: Record<string, string>
  required?: boolean
}) {
  const set = (key: keyof AddressForm) => (v: string) => onChange((a) => ({ ...a, [key]: v }))
  const cep = normalizeCep(value.cep)
  const need = required || Boolean(value.cep)

  useEffect(() => {
    if (!cep) return
    const controller = new AbortController()
    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }) => {
        if (data.erro) return
        onChange((a) => ({
          ...a,
          street: data.logradouro || a.street,
          district: data.bairro || a.district,
          city: data.localidade || a.city,
          uf: data.uf || a.uf,
        }))
      })
      .catch(() => {
        // sem ViaCEP: o cliente digita o endereço
      })
    return () => controller.abort()
  }, [cep, onChange])

  return (
    <C.Grid>
      <Input label="CEP" name="cep" span={2} spanSm={2} required={need} value={value.cep} onChange={(v) => set('cep')(mask.cep(v))} error={errors.cep} autoComplete="postal-code" inputMode="numeric" placeholder="00000-000" />
      <Input label="Rua / Avenida" name="street" span={4} required={need} value={value.street} onChange={set('street')} error={errors.street} autoComplete="address-line1" />
      <Input label="Número" name="number" span={2} spanSm={1} required={need} value={value.number} onChange={set('number')} error={errors.number} placeholder="123 ou S/N" />
      <Input label="Complemento" name="complement" span={4} spanSm={1} required={false} value={value.complement} onChange={set('complement')} placeholder="Apto, bloco (opcional)" autoComplete="address-line2" />
      <Input label="Bairro" name="district" span={2} required={need} value={value.district} onChange={set('district')} error={errors.district} />
      <Input label="Cidade" name="city" span={3} spanSm={1} required={need} value={value.city} onChange={set('city')} error={errors.city} autoComplete="address-level2" />
      <C.Field $span={1} $spanSm={1} data-invalid={Boolean(errors.uf)}>
        <span>UF {need && <C.Required>*</C.Required>}</span>
        <select name="uf" value={value.uf} onChange={(e) => set('uf')(e.target.value)} autoComplete="address-level1" aria-invalid={Boolean(errors.uf)}>
          <option value="">—</option>
          {UFS.map((uf) => (
            <option key={uf}>{uf}</option>
          ))}
        </select>
        {errors.uf && <small>{errors.uf}</small>}
      </C.Field>
    </C.Grid>
  )
}

/** Logo "G" do Google (cores oficiais), exigido no botão de login. */
export function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  )
}
