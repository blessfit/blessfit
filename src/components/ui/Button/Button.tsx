import type { AnchorHTMLAttributes } from 'react'
import type { IconComponent } from '../Icons'
import * as S from './Button.styles'

export type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: S.ButtonVariant
  size?: S.ButtonSize
  /** Ícone antes do texto (ex.: WhatsApp). */
  glyph?: IconComponent
  /** Ícone depois do texto (seta) — desliza no hover. */
  icon?: IconComponent
}

/** Botão-link (pílula) com preenchimento que sobe no hover. */
export function Button({ variant = 'cream', size = 'md', glyph, icon, children, ...rest }: ButtonProps) {
  return (
    <S.Root $variant={variant} $size={size} {...rest}>
      {glyph && <S.Glyph as={glyph} />}
      {children}
      {icon && <S.Icon as={icon} />}
    </S.Root>
  )
}

export { Icon as ButtonIcon } from './Button.styles'
