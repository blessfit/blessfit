import styled, { css } from 'styled-components'
import { Button, Muted, Reveal, Section, Title as BaseTitle } from '@/components/ui'
import { media } from '@/styles/media'
import { arch, snapScroller } from '@/styles/mixins'

export const Root = styled(Section)`
  padding-top: clamp(24px, 4vw, 64px);
`

export const Head = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px 48px;
  margin-bottom: clamp(48px, 6vw, 88px);
`

export const Title = styled(BaseTitle)`
  margin-top: 20px;
`

export const Intro = styled(Muted)`
  max-width: 36ch;
`

export const Products = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: clamp(20px, 2.8vw, 44px);

  ${media.md} {
    ${snapScroller}
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: min(80%, 360px);
    margin-inline: calc(var(--gutter) * -1);
    padding: 4px var(--gutter) 12px;
  }
`

export const Product = styled(Reveal)`
  &:nth-child(2) {
    margin-top: clamp(48px, 7vw, 112px);
  }

  ${media.md} {
    scroll-snap-align: start;

    &:nth-child(2) {
      margin-top: 0;
    }
  }
`

export const Media = styled.div`
  ${arch}
  position: relative;
  aspect-ratio: 3 / 4.2;
  background: var(--sand);
`

export const Img = styled.img<{ $alt?: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 10%;
  transition:
    opacity 0.8s var(--ease),
    transform 1.6s var(--ease);

  ${Product}:hover & {
    transform: scale(1.05);
  }

  /* segunda foto, revelada no hover */
  ${({ $alt }) =>
    $alt &&
    css`
      opacity: 0;
      object-position: 50% 30%;

      ${Product}:hover & {
        opacity: 1;
      }
    `}
`

export const Tag = styled.span`
  position: absolute;
  left: 50%;
  bottom: 18px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgb(242 237 218 / 0.9);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: var(--ink);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  transform: translateX(-50%);
`

export const Body = styled.div`
  padding-top: 24px;
`

export const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

export const Name = styled.h3`
  font-size: clamp(1.15rem, 1.5vw, 1.4rem);
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -0.01em;
`

export const Swatch = styled.span`
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow:
    0 0 0 3px var(--cream),
    0 0 0 4px var(--line-cream);
`

export const Color = styled.p`
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--petrol);
`

export const Desc = styled.p`
  margin-top: 14px;
  font-size: 15px;
  color: var(--on-cream-muted);
`

export const Chips = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;

  li {
    padding: 6px 12px;
    border: 1px solid var(--line-cream);
    border-radius: 999px;
    font-size: 12px;
  }
`

export const Cta = styled(Button)`
  width: 100%;
  margin-top: 24px;
`
