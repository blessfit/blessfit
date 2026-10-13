import styled from 'styled-components'
import { IconButton } from '@/components/ui'
import { media } from '@/styles/media'

export const Hover = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s var(--ease);
`

export const Card = styled.article`
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--white);
  overflow: hidden;
  transition:
    box-shadow 0.4s var(--ease),
    border-color 0.4s var(--ease);

  ${media.hover} {
    &:hover {
      border-color: transparent;
      box-shadow: var(--shadow);
    }

    &:hover ${Hover} {
      opacity: 1;
    }
  }
`

export const Media = styled.div`
  position: relative;
  aspect-ratio: 4 / 5;
  background: var(--surface);
  overflow: hidden;
`

export const ImageButton = styled.button`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  cursor: zoom-in;

  &:focus-visible {
    outline-offset: -4px;
  }
`

export const Badges = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
`

export const Badge = styled.span<{ $tone?: 'sale' }>`
  padding: 6px 10px;
  border-radius: 999px;
  background: ${({ $tone }) => ($tone === 'sale' ? 'var(--petrol)' : 'var(--white)')};
  color: ${({ $tone }) => ($tone === 'sale' ? 'var(--white)' : 'var(--ink)')};
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

export const Tools = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  gap: 8px;
`

export const Tool = styled(IconButton)<{ $on?: boolean }>`
  color: ${({ $on }) => ($on ? 'var(--petrol)' : 'var(--ink)')};

  svg {
    width: 20px;
    height: 20px;
  }
`

export const Info = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  padding: 18px 18px 14px;
`

export const Meta = styled.p`
  color: var(--text-faint);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

export const Name = styled.h3`
  margin-top: -6px;
  font-size: 1.15rem;
  font-weight: 750;
  letter-spacing: -0.02em;
  line-height: 1.2;
`

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 4px;
`

export const Hint = styled.p`
  min-height: 1.2em;
  color: var(--petrol);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
`
