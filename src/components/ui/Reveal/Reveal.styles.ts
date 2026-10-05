import { motion } from 'motion/react'
import styled, { css } from 'styled-components'
import { scriptAccent } from '@/styles/mixins'

/** Máscara de cada palavra do SplitReveal. */
export const Word = styled.span<{ $accent?: boolean }>`
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.1em;
  margin-bottom: -0.1em;

  ${({ $accent }) =>
    $accent &&
    css`
      ${scriptAccent}
      overflow: visible;
      vertical-align: baseline;
    `}
`

export const WordInner = styled(motion.span)`
  display: inline-block;
`

/** Palavra do ScrollLitText (a opacidade é controlada pelo scroll). */
export const LitWord = styled(motion.span)<{ $em?: boolean }>`
  color: ${({ $em }) => ($em ? 'var(--accent)' : 'inherit')};
`
