import { motion } from 'motion/react'
import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  from {
    opacity: 0.9;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.7);
  }
`

export const Fab = styled(motion.a)`
  position: fixed;
  right: clamp(16px, 2.4vw, 32px);
  bottom: clamp(16px, 2.4vw, 32px);
  z-index: 60;
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--mint);
  color: var(--ink);
  box-shadow: 0 14px 36px rgb(0 0 0 / 0.35);

  svg {
    width: 26px;
    height: 26px;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid var(--mint);
    border-radius: 50%;
    animation: ${pulse} 2.8s var(--ease) infinite;
  }
`
