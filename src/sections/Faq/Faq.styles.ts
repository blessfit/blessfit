import styled, { css } from 'styled-components'
import { Container } from '@/components/ui'
import { media } from '@/styles/media'
import { collapsible } from '@/styles/mixins'

export const Grid = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  align-items: start;
  gap: clamp(40px, 7vw, 120px);

  ${media.md} {
    grid-template-columns: 1fr;
  }
`

export const Intro = styled.div`
  position: sticky;
  top: calc(var(--header-h) + 32px);
  display: grid;
  justify-items: start;
  gap: 22px;

  ${media.md} {
    position: static;
  }
`

export const List = styled.ul`
  border-top: 1px solid var(--line-cream);
`

export const Item = styled.li`
  border-bottom: 1px solid var(--line-cream);
`

export const Icon = styled.span<{ $open: boolean }>`
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--line-cream);
  border-radius: 50%;
  transition:
    transform 0.6s var(--ease),
    background-color 0.4s var(--ease),
    color 0.4s var(--ease),
    border-color 0.4s var(--ease);

  svg {
    width: 16px;
    height: 16px;
  }

  ${({ $open }) =>
    $open &&
    css`
      border-color: var(--ink);
      background: var(--ink);
      color: var(--cream);
      transform: rotate(45deg);
    `}
`

export const Question = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  padding: 26px 0;
  text-align: left;
  font-size: clamp(1.05rem, 1.4vw, 1.25rem);
  font-weight: 400;
  line-height: 1.4;

  &:hover ${Icon} {
    border-color: var(--ink);
  }
`

export const Answer = styled.div<{ $open: boolean }>`
  ${({ $open }) => collapsible($open)}
  transition: grid-template-rows 0.6s var(--ease);

  p {
    max-width: 62ch;
    padding-bottom: 28px;
    color: var(--on-cream-muted);
  }
`
