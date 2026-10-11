import styled, { css, keyframes } from 'styled-components'
import { media } from '@/styles/media'
import { IconButton } from '../IconButton'

const fade = keyframes`
  from { opacity: 0; }
`

const slideRight = keyframes`
  from { transform: translateX(100%); }
`

const slideLeft = keyframes`
  from { transform: translateX(-100%); }
`

const rise = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
`

const variants = {
  modal: css`
    width: min(calc(100% - 32px), var(--w));
    max-height: min(calc(100dvh - 48px), 900px);
    margin: auto;
    border-radius: var(--radius);
    animation: ${rise} 0.45s var(--ease);

    ${media.sm} {
      width: 100%;
      max-height: 92dvh;
      margin: auto 0 0;
      border-radius: var(--radius) var(--radius) 0 0;
    }
  `,
  right: css`
    width: min(100%, 440px);
    height: 100dvh;
    max-height: none;
    margin: 0 0 0 auto;
    animation: ${slideRight} 0.45s var(--ease);
  `,
  left: css`
    width: min(88%, 400px);
    height: 100dvh;
    max-height: none;
    margin: 0 auto 0 0;
    animation: ${slideLeft} 0.45s var(--ease);
  `,
}

export type DialogVariant = keyof typeof variants

export const Root = styled.dialog<{ $variant: DialogVariant; $width?: number }>`
  --w: ${({ $width = 960 }) => $width}px;
  padding: 0;
  border: 0;
  max-width: 100%;
  background: var(--white);
  color: var(--text);
  overflow: hidden;
  ${({ $variant }) => variants[$variant]}

  &::backdrop {
    background: rgb(11 11 15 / 0.5);
    backdrop-filter: blur(3px);
    animation: ${fade} 0.3s ease;
  }
`

export const Box = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: inherit;
`

export const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 14px 14px 24px;
  border-bottom: 1px solid var(--line);
`

export const Title = styled.h2`
  font-size: 15px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const CloseButton = styled(IconButton)``

export const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
`

export const Foot = styled.div`
  padding: 20px 24px calc(20px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--line);
  background: var(--paper);
`
