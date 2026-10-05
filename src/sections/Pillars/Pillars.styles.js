import styled from 'styled-components'
import { Muted, Reveal, Section, Title as BaseTitle } from '@/components/ui'
import { media } from '@/styles/media'
import { collapsible } from '@/styles/mixins'

export const Root = styled(Section)`
  padding-top: clamp(24px, 4vw, 64px);
`

export const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px 48px;
`

export const Title = styled(BaseTitle)`
  margin-top: 20px;
`

export const Intro = styled(Muted)`
  max-width: 32ch;
`

export const Row = styled.div`
  display: flex;
  gap: clamp(10px, 1.2vw, 16px);
  height: clamp(480px, 76vh, 740px);
  margin-top: clamp(40px, 5vw, 72px);

  ${media.md} {
    flex-direction: column;
    height: auto;
  }
`

export const Img = styled.img`
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: ${({ $active }) => ($active ? 'none' : 'grayscale(0.7) brightness(0.6)')};
  transform: ${({ $active }) => ($active ? 'scale(1)' : 'scale(1.06)')};
  transition:
    filter 0.9s var(--ease),
    transform 1.4s var(--ease);

  ${media.md} {
    filter: brightness(0.8);
    transform: none;
  }
`

export const Pillar = styled(Reveal)`
  position: relative;
  isolation: isolate;
  flex: 1 1 0;
  flex-grow: ${({ $active }) => ($active ? 2.4 : 1)};
  min-width: 0;
  overflow: hidden;
  border-radius: 28px;
  cursor: default;
  transition: flex-grow 0.9s var(--ease);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(180deg, rgb(5 5 14 / 0) 30%, rgb(5 5 14 / 0.9) 100%);
  }

  ${media.md} {
    flex: none;
    height: 420px;
  }
`

export const Content = styled.div`
  position: absolute;
  inset: auto 0 0;
  padding: clamp(22px, 2.6vw, 40px);
`

export const Num = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--mint);
`

export const PillarTitle = styled.h3`
  margin-top: 10px;
  font-size: clamp(2.2rem, 4vw, 4.2rem);
  font-weight: 200;
  line-height: 1;
  letter-spacing: -0.04em;
`

export const Pt = styled.p`
  margin-top: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--on-ink-muted);
`

/** Texto que expande no pilar ativo (sempre aberto no mobile). */
export const Text = styled.div`
  ${({ $active }) => collapsible($active)}
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition:
    grid-template-rows 0.9s var(--ease),
    opacity 0.6s var(--ease);

  p {
    max-width: 38ch;
    padding-top: 16px;
    color: rgb(242 237 218 / 0.82);
  }

  ${media.md} {
    grid-template-rows: 1fr;
    opacity: 1;
  }
`
