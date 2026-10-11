import { useId } from 'react'
import styled from 'styled-components'
import type { Variant } from '@/data/products'
import { srOnly } from '@/styles/mixins'

const Fieldset = styled.fieldset`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
`

const Legend = styled.legend`
  ${srOnly}
`

const Options = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: -6px;
`

const Input = styled.input`
  ${srOnly}
`

/** Área de toque de 32px com a bolinha de cor de 18px no centro. */
const Dot = styled.label<{ $hex: string }>`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  cursor: pointer;

  &::before {
    content: '';
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ $hex }) => $hex};
    box-shadow:
      inset 0 0 0 1px rgb(11 11 15 / 0.14),
      0 0 0 2px var(--white),
      0 0 0 2px transparent;
    transition: box-shadow 0.2s;
  }

  &:hover::before {
    box-shadow:
      inset 0 0 0 1px rgb(11 11 15 / 0.14),
      0 0 0 2px var(--white),
      0 0 0 3.5px var(--line-strong);
  }

  ${Input}:checked + &::before {
    box-shadow:
      inset 0 0 0 1px rgb(11 11 15 / 0.14),
      0 0 0 2px var(--white),
      0 0 0 3.5px var(--ink);
  }

  ${Input}:focus-visible + & {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    border-radius: 50%;
  }
`

const Name = styled.span`
  color: var(--text-muted);
  font-size: 13px;
`

type SwatchesProps = {
  variants: Variant[]
  value: Variant
  onChange: (variant: Variant) => void
}

/** Escolha de cor. Cada cor tem as suas fotos — ao trocar, o card troca as imagens. */
export function Swatches({ variants, value, onChange }: SwatchesProps) {
  const name = useId()
  return (
    <Fieldset>
      <Legend>Cor</Legend>
      <Options>
        {variants.map((variant) => {
          const id = `${name}-${variant.color.name}`
          return (
            <span key={variant.color.name}>
              <Input
                type="radio"
                id={id}
                name={name}
                checked={variant === value}
                onChange={() => onChange(variant)}
              />
              <Dot htmlFor={id} $hex={variant.color.hex} title={variant.color.name}>
                <Legend as="span">{variant.color.name}</Legend>
              </Dot>
            </span>
          )
        })}
      </Options>
      <Name aria-hidden="true">{value.color.name}</Name>
    </Fieldset>
  )
}
