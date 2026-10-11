import styled, { css } from 'styled-components'
import { IconButton } from '@/components/ui'
import { snapScroller } from '@/styles/mixins'
import { media } from '@/styles/media'

type Align = 'left' | 'right'

export const Root = styled.section`
  position: relative;
  background: var(--olive-deep);
`

export const Track = styled.div`
  ${snapScroller}
  display: flex;
  scroll-padding-inline: 0;
`

export const Slide = styled.div<{ $align: Align }>`
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'left' ? 'flex-start' : 'flex-end')};
  flex: 0 0 100%;
  height: clamp(480px, 44vw, 720px);
  scroll-snap-align: start;
  scroll-snap-stop: always;
  color: var(--white);

  /* escurece o lado do texto para dar contraste sobre qualquer foto */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      ${({ $align }) => ($align === 'left' ? '90deg' : '270deg')},
      rgb(20 25 12 / 0.78) 0%,
      rgb(20 25 12 / 0.45) 38%,
      rgb(20 25 12 / 0) 65%
    );
  }

  ${media.sm} {
    align-items: flex-end;
    justify-content: flex-start;
    height: calc(100svh - 170px);
    min-height: 520px;
    max-height: 720px;

    &::after {
      background: linear-gradient(0deg, rgb(20 25 12 / 0.9) 0%, rgb(20 25 12 / 0.5) 45%, rgb(20 25 12 / 0) 72%);
    }

    img {
      object-position: var(--focus-mobile, center) !important;
    }
  }
`

export const Media = styled.div`
  position: absolute;
  inset: 0;
  z-index: -2;
`

export const Content = styled.div<{ $align: Align }>`
  width: 100%;
  max-width: 720px;
  padding: clamp(28px, 5vw, 80px) clamp(28px, 7vw, 120px);
  ${({ $align }) =>
    $align === 'right' &&
    css`
      ${media.desktop} {
        text-align: right;

        > div:last-child {
          justify-content: flex-end;
        }
      }
    `}

  ${media.sm} {
    padding: 28px 20px 64px;
  }
`

export const Eyebrow = styled.p`
  display: inline-block;
  margin-bottom: 18px;
  padding: 7px 14px;
  border: 1px solid rgb(255 255 255 / 0.45);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`

export const Title = styled.h1`
  font-size: clamp(2.5rem, 5.6vw, 5.4rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.045em;
  text-wrap: balance;
`

export const Text = styled.p`
  max-width: 40ch;
  margin-top: clamp(14px, 1.8vw, 22px);
  margin-inline: inherit;
  color: rgb(255 255 255 / 0.88);
  font-size: clamp(1rem, 1.3vw, 1.2rem);
  font-weight: 500;
  line-height: 1.5;

  ${media.desktop} {
    display: inline-block;
  }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: clamp(22px, 2.6vw, 32px);

  ${media.sm} {
    flex-direction: column;

    a {
      width: 100%;
    }
  }
`

export const Arrow = styled(IconButton)<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => $side}: clamp(12px, 1.6vw, 28px);
  z-index: 2;
  width: 48px;
  height: 48px;
  transform: translateY(-50%);
  background: rgb(255 255 255 / 0.9);

  ${media.sm} {
    display: none;
  }
`

export const Dots = styled.div`
  position: absolute;
  left: 50%;
  bottom: 18px;
  z-index: 2;
  display: flex;
  gap: 4px;
  transform: translateX(-50%);
`

/** Área de toque de 24px com o indicador visível dentro. */
export const Dot = styled.button`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.5);
    transition:
      width 0.4s var(--ease),
      background 0.4s var(--ease);
  }

  &[aria-current='true']::before {
    width: 22px;
    background: var(--white);
  }

  &[aria-current='true'] {
    width: 34px;
  }
`
