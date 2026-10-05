import styled, { css } from 'styled-components'
import { Container, Lead as BaseLead, Reveal, Title as BaseTitle } from '@/components/ui'
import { media } from '@/styles/media'
import { arch } from '@/styles/mixins'

export const Grid = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  align-items: start;
  gap: clamp(40px, 7vw, 120px);

  ${media.md} {
    grid-template-columns: 1fr;
  }
`

export const Visual = styled.div`
  position: sticky;
  top: calc(var(--header-h) + 32px);

  ${media.md} {
    position: relative;
    top: 0;
    width: min(100%, 440px);
  }
`

export const Frame = styled(Reveal)`
  ${arch}
  aspect-ratio: 4 / 5.4;
  background: var(--petrol);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  ${media.md} {
    aspect-ratio: 4 / 4.4;
  }
`

export const Chip = styled(Reveal)`
  position: absolute;
  left: -16px;
  bottom: 12%;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 13px 20px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--cream);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  box-shadow: 0 20px 40px rgb(5 5 14 / 0.25);

  ${media.md} {
    left: 12px;
  }
`

export const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 0 4px rgb(163 212 196 / 0.25);
`

export const Title = styled(BaseTitle)`
  margin-top: 22px;
`

export const Lead = styled(BaseLead)`
  max-width: 44ch;
  margin-top: 24px;
`

export const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 52px 40px;
  margin-top: clamp(48px, 5vw, 72px);
  padding-top: 48px;
  border-top: 1px solid var(--line-cream);

  ${media.sm} {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`

export const FeatureIcon = styled.span`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border: 1px solid var(--line-cream);
  border-radius: 50%;
  color: var(--petrol);

  svg {
    width: 28px;
    height: 28px;
  }

  /* o traço do ícone é "desenhado" quando entra na tela */
  svg :is(path, rect) {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke-dashoffset 1.8s var(--ease) calc(var(--d) + 0.25s);
  }

  ${media.sm} {
    grid-row: span 2;
    width: 56px;
    height: 56px;
  }

  ${media.reducedMotion} {
    svg :is(path, rect) {
      stroke-dashoffset: 0;
    }
  }
`

/** `--d` (inline) define o atraso da entrada de cada item. */
export const Feature = styled.li`
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.9s var(--ease) var(--d),
    transform 0.9s var(--ease) var(--d);

  ${({ $inView }) =>
    $inView &&
    css`
      opacity: 1;
      transform: none;

      ${FeatureIcon} svg :is(path, rect) {
        stroke-dashoffset: 0;
      }
    `}

  ${media.sm} {
    display: grid;
    grid-template-columns: 56px 1fr;
    column-gap: 18px;
  }

  ${media.reducedMotion} {
    opacity: 1;
    transform: none;
  }
`

export const FeatureTitle = styled.h3`
  margin: 22px 0 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;

  ${media.sm} {
    margin: 4px 0 6px;
  }
`

export const FeatureText = styled.p`
  max-width: 34ch;
  font-size: 15px;
  color: var(--on-cream-muted);
`
