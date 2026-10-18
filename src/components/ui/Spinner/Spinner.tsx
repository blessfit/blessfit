import styled, { keyframes } from 'styled-components'
import { media } from '@/styles/media'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

/** Rodinha de carregando, na cor do texto ao redor. */
export const Spinner = styled.span.attrs({ 'aria-hidden': true })`
  display: inline-block;
  flex: none;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  vertical-align: -0.15em;
  animation: ${spin} 0.7s linear infinite;

  ${media.reducedMotion} {
    animation-duration: 1.6s;
  }
`
