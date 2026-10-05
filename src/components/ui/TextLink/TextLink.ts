import styled, { keyframes } from 'styled-components'

const line = keyframes`
  0% {
    transform: scaleX(1);
    transform-origin: right;
  }
  45% {
    transform: scaleX(0);
    transform-origin: right;
  }
  46% {
    transform: scaleX(0);
    transform-origin: left;
  }
  100% {
    transform: scaleX(1);
    transform-origin: left;
  }
`

/** Link sublinhado em caixa alta; a linha "corre" no hover. */
export const TextLink = styled.a`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding-block: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;

  svg {
    width: 16px;
    height: 16px;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: currentColor;
    transform-origin: left;
  }

  &:hover::after {
    animation: ${line} 0.9s var(--ease);
  }
`
