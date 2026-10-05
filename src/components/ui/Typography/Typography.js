import styled from 'styled-components'
import { script, scriptAccent } from '@/styles/mixins'

export const Eyebrow = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.34em;
  text-transform: uppercase;

  &::before {
    content: '';
    width: 32px;
    height: 1px;
    background: currentColor;
    opacity: 0.55;
  }
`

/** Título de seção. Palavras em <em> ganham destaque em caligrafia. */
export const Title = styled.h2`
  font-size: clamp(2.35rem, 5vw, 4.9rem);
  font-weight: 200;
  line-height: 1.04;
  letter-spacing: -0.035em;
  text-wrap: balance;

  em {
    ${scriptAccent}
  }
`

/** Texto secundário; a cor vem do contexto (--muted). */
export const Muted = styled.p`
  color: var(--muted);
`

export const Lead = styled(Muted)`
  font-size: clamp(1rem, 1.2vw, 1.125rem);
  line-height: 1.75;
`

export const Script = styled.p`
  ${script}
`
