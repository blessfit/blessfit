import { motion } from 'motion/react'
import styled, { css } from 'styled-components'
import { Container, Eyebrow as BaseEyebrow, ScrollLitText } from '@/components/ui'

/* `$static` (movimento reduzido): sem a área fixa de scroll. */

export const Root = styled.section`
  position: relative;
  height: ${({ $static }) => ($static ? 'auto' : '280vh')};
  background: var(--ink);
`

export const Sticky = styled.div`
  position: sticky;
  top: 0;
  isolation: isolate;
  display: grid;
  place-items: center;
  height: 100vh;
  height: 100svh;
  overflow: hidden;

  ${({ $static }) =>
    $static &&
    css`
      position: relative;
      height: auto;
      padding-block: var(--section-y);
    `}
`

export const Glow = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(50% 45% at 50% 55%, rgb(10 106 130 / 0.32), transparent 72%);
`

export const Mono = styled(motion.div)`
  position: absolute;
  z-index: -1;
  width: min(78vw, 1000px);
  color: var(--cream);
  opacity: 0.035;

  svg {
    width: 100%;
    height: auto;
  }
`

export const Inner = styled(Container)`
  max-width: 1120px;
  text-align: center;
`

export const Eyebrow = styled(BaseEyebrow)`
  justify-content: center;
  color: var(--mint);

  &::after {
    content: '';
    width: 32px;
    height: 1px;
    background: currentColor;
    opacity: 0.55;
  }
`

export const Text = styled(ScrollLitText)`
  margin-top: clamp(28px, 4vh, 44px);
  font-size: clamp(1.55rem, 3.4vw, 3.2rem);
  font-weight: 250;
  line-height: 1.24;
  letter-spacing: -0.022em;
  text-wrap: balance;
`

export const Ref = styled(motion.footer)`
  margin-top: clamp(28px, 4vh, 44px);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--on-ink-muted);

  cite {
    font-style: normal;
    color: var(--cream);
  }
`
