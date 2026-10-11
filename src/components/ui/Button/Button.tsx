import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import type { IconComponent } from '../Icons'
import * as S from './Button.styles'

export type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Renderiza um <button> em vez de um link. */
    as?: 'a' | 'button'
    variant?: S.ButtonVariant
    size?: S.ButtonSize
    /** Ocupa toda a largura disponível. */
    block?: boolean
    /** Ícone antes do texto (ex.: WhatsApp). */
    glyph?: IconComponent
    /** Ícone depois do texto (seta) — desliza no hover. */
    icon?: IconComponent
  }

/** Botão em pílula com preenchimento que sobe no hover. É um link por padrão (`as="button"` para ações). */
export function Button({
  as = 'a',
  variant = 'cream',
  size = 'md',
  block,
  glyph,
  icon,
  children,
  ...rest
}: ButtonProps) {
  const buttonType = as === 'button' ? { type: rest.type ?? 'button' } : {}
  return (
    <S.Root as={as} $variant={variant} $size={size} $block={block} {...rest} {...buttonType}>
      {glyph && <S.Glyph as={glyph} />}
      {children}
      {icon && <S.Icon as={icon} />}
    </S.Root>
  )
}

export { Icon as ButtonIcon } from './Button.styles'
