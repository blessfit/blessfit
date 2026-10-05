import * as S from './Button.styles'

/**
 * Botão-link (pílula) com preenchimento que sobe no hover.
 * - variant: 'cream' | 'ink' | 'lineInk' | 'lineCream'
 * - size: 'md' | 'sm'
 * - glyph: ícone antes do texto · icon: ícone depois do texto
 */
export function Button({ variant = 'cream', size = 'md', glyph, icon, children, ...rest }) {
  return (
    <S.Root $variant={variant} $size={size} {...rest}>
      {glyph && <S.Glyph as={glyph} />}
      {children}
      {icon && <S.Icon as={icon} />}
    </S.Root>
  )
}

export { Icon as ButtonIcon } from './Button.styles'
