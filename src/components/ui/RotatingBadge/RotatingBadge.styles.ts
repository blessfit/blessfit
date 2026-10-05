import { motion } from 'motion/react'
import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const Root = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--ink);
  color: var(--cream);
`

export const ScrollLayer = styled(motion.div)`
  position: absolute;
  inset: 0;
`

export const Ring = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
  animation: ${spin} 28s linear infinite;

  text {
    font-family: var(--font-sans);
    font-size: 13.5px;
    font-weight: 600;
    fill: currentColor;
  }
`

export const Core = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  width: 50%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--cream);
  color: var(--ink);

  svg {
    width: 54%;
    height: auto;
  }
`
