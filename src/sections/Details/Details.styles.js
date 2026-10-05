import { motion } from 'motion/react'
import styled, { css } from 'styled-components'
import { Muted, Title as BaseTitle } from '@/components/ui'
import { snapScroller } from '@/styles/mixins'

/*
 * `$pinned` (desktop): a seção fica fixa e o scroll move a galeria na horizontal.
 * Sem `$pinned` (mobile / movimento reduzido): carrossel com arraste nativo.
 */

export const Root = styled.section`
  position: relative;
  background: var(--ink);

  ${({ $pinned }) =>
    !$pinned &&
    css`
      padding-block: var(--section-y);
    `}
`

export const Sticky = styled.div`
  ${({ $pinned }) =>
    $pinned &&
    css`
      position: sticky;
      top: 0;
      display: flex;
      align-items: center;
      height: 100vh;
      height: 100svh;
      overflow: hidden;
    `}
`

export const Track = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: clamp(20px, 2.4vw, 36px);
  width: max-content;
  padding-inline: var(--gutter);

  ${({ $pinned }) =>
    $pinned
      ? css`
          will-change: transform;
        `
      : css`
          ${snapScroller}
          align-items: flex-start;
          width: auto;
          padding-bottom: 8px;
        `}
`

export const Intro = styled.div`
  ${({ $pinned }) =>
    $pinned
      ? css`
          flex: none;
          width: min(520px, 38vw);
          padding-right: clamp(16px, 3vw, 56px);
        `
      : css`
          max-width: var(--container);
          margin: 0 auto 40px;
          padding-inline: var(--gutter);
        `}
`

export const Title = styled(BaseTitle)`
  margin-top: 22px;
`

export const Lead = styled(Muted)`
  max-width: 36ch;
  margin-top: 24px;
`

export const Progress = styled.div`
  position: relative;
  height: 1px;
  margin-top: 48px;
  overflow: hidden;
  background: var(--line-ink);

  span {
    position: absolute;
    inset: 0;
    background: var(--mint);
    transform-origin: left;
  }
`

export const Card = styled.article`
  flex: none;
  width: clamp(280px, 25vw, 380px);

  ${({ $pinned }) =>
    $pinned
      ? css`
          &:nth-of-type(even) {
            margin-top: 90px;
          }
        `
      : css`
          width: min(76vw, 340px);
          scroll-snap-align: start;
        `}
`

export const CardMedia = styled.div`
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--ink-soft);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.4s var(--ease);
  }

  ${Card}:hover & img {
    transform: scale(1.06);
  }
`

export const Caption = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`

export const Num = styled.span`
  padding-top: 5px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--mint);
`

export const CardTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 400;
  line-height: 1.35;
`

export const CardText = styled.p`
  margin-top: 6px;
  font-size: 14.5px;
  color: var(--on-ink-muted);
`

export const Outro = styled.div`
  flex: none;
  width: min(420px, 32vw);
  padding-left: clamp(24px, 4vw, 64px);
`

export const OutroText = styled.p`
  margin-bottom: 32px;
  font-size: clamp(1.6rem, 2.6vw, 2.6rem);
  font-weight: 200;
  line-height: 1.15;
  letter-spacing: -0.03em;
`
