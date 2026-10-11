import { useId } from 'react'
import styled from 'styled-components'
import type { Size } from '@/data/products'
import { srOnly } from '@/styles/mixins'

const Fieldset = styled.fieldset`
  display: grid;
  gap: 8px;
`

const Legend = styled.legend<{ $hidden?: boolean }>`
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  ${({ $hidden }) => $hidden && srOnly}
`

const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Input = styled.input`
  ${srOnly}
`

const Sr = styled.span`
  ${srOnly}
`

const Chip = styled.label<{ $compact?: boolean }>`
  display: grid;
  place-items: center;
  min-width: ${({ $compact }) => ($compact ? '40px' : '48px')};
  height: ${({ $compact }) => ($compact ? '40px' : '46px')};
  padding: 0 10px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--white);
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s,
    color 0.2s;

  &:hover {
    border-color: var(--ink);
  }

  ${Input}:checked + & {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--white);
  }

  ${Input}:focus-visible + & {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  ${Input}:disabled + & {
    color: var(--text-faint);
    background: linear-gradient(to top right, transparent 48%, var(--line-strong) 49% 51%, transparent 52%);
    cursor: not-allowed;
    border-color: var(--line);
  }
`

type SizePickerProps = {
  sizes: Size[]
  soldOut?: Size[]
  value: Size | null
  onChange: (size: Size) => void
  label?: string
  hideLabel?: boolean
  compact?: boolean
}

/** Escolha de tamanho (botões de rádio). Tamanhos esgotados aparecem riscados. */
export function SizePicker({
  sizes,
  soldOut = [],
  value,
  onChange,
  label = 'Tamanho',
  hideLabel,
  compact,
}: SizePickerProps) {
  const name = useId()
  return (
    <Fieldset>
      <Legend $hidden={hideLabel}>
        {label}
        {value ? `: ${value}` : ''}
      </Legend>
      <Options>
        {sizes.map((size) => {
          const id = `${name}-${size}`
          const out = soldOut.includes(size)
          return (
            <span key={size}>
              <Input
                type="radio"
                id={id}
                name={name}
                value={size}
                checked={value === size}
                disabled={out}
                onChange={() => onChange(size)}
              />
              <Chip htmlFor={id} $compact={compact} title={out ? `${size} esgotado` : undefined}>
                {size}
                {out && <Sr> (esgotado)</Sr>}
              </Chip>
            </span>
          )
        })}
      </Options>
    </Fieldset>
  )
}
