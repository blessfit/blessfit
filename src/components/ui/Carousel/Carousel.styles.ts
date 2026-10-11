import styled from 'styled-components'
import { snapScroller } from '@/styles/mixins'
import { media } from '@/styles/media'
import { IconButton } from '../IconButton'

export const Root = styled.div`
  position: relative;
`

const columns = (n: number) => `calc((100% - ${n - 1} * var(--gap)) / ${n})`

export const Track = styled.ul<{ $desktop: number; $tablet: number }>`
  --gap: clamp(12px, 1.6vw, 24px);
  ${snapScroller}
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: ${({ $desktop }) => columns($desktop)};
  column-gap: var(--gap);
  scroll-padding-inline: 0;
  padding-bottom: 4px;

  &:focus-visible {
    outline-offset: 6px;
  }

  ${media.md} {
    grid-auto-columns: ${({ $tablet }) => columns($tablet)};
  }

  /* celular: um card por vez, com uma pontinha do próximo para indicar que rola */
  ${media.sm} {
    grid-auto-columns: 84%;
  }
`

export const Slide = styled.li`
  display: flex;
  scroll-snap-align: start;

  & > * {
    flex: 1;
    min-width: 0;
  }
`

export const Arrow = styled(IconButton)<{ $side: 'left' | 'right' }>`
  position: absolute;
  /* alinhadas ao meio da foto dos cards */
  top: 36%;
  ${({ $side }) => $side}: -22px;
  z-index: 2;
  width: 48px;
  height: 48px;
  transform: translateY(-50%);

  ${media.md} {
    ${({ $side }) => $side}: 8px;
  }

  ${media.sm} {
    width: 42px;
    height: 42px;
  }
`

export const Progress = styled.div`
  position: relative;
  height: 2px;
  margin-top: clamp(20px, 3vw, 32px);
  border-radius: 2px;
  background: var(--line);
  overflow: hidden;

  span {
    position: absolute;
    top: 0;
    bottom: 0;
    background: var(--ink);
    transition:
      left 0.2s linear,
      width 0.2s linear;
  }
`
