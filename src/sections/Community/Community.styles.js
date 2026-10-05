import styled from 'styled-components'
import { Eyebrow, Monogram, Reveal, Title as BaseTitle } from '@/components/ui'
import { media } from '@/styles/media'

export const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px 48px;
`

export const Title = styled(BaseTitle)`
  margin-top: 20px;
`

export const Side = styled.div`
  display: grid;
  justify-items: start;
  gap: 22px;
  max-width: 38ch;

  strong {
    font-weight: 600;
    color: var(--ink);
  }
`

export const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: clamp(8px, 1vw, 14px);
  margin-top: clamp(40px, 5vw, 72px);

  ${media.md} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  ${media.sm} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export const Overlay = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(5 5 14 / 0.45);
  color: var(--cream);
  opacity: 0;
  transition: opacity 0.5s var(--ease);

  svg {
    width: 28px;
    height: 28px;
  }
`

export const TileLink = styled.a`
  position: relative;
  display: block;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 16px;
  background: var(--sand);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.2s var(--ease);
  }

  &:hover img {
    transform: scale(1.08);
  }

  &:hover ${Overlay}, &:focus-visible ${Overlay} {
    opacity: 1;
  }
`

/* ---------- lista VIP ---------- */

export const Vip = styled(Reveal)`
  --accent: var(--mint);
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
  align-items: end;
  gap: 40px;
  margin-top: clamp(72px, 9vw, 140px);
  padding: clamp(36px, 6vw, 88px);
  overflow: hidden;
  border-radius: 32px;
  background: var(--petrol-deep);
  color: var(--cream);

  ${Eyebrow} {
    color: var(--mint);
  }

  ${media.md} {
    grid-template-columns: 1fr;
  }
`

export const VipMono = styled(Monogram)`
  position: absolute;
  right: -6%;
  bottom: -30%;
  z-index: -1;
  width: 52%;
  color: var(--cream);
  opacity: 0.06;
`

export const VipTitle = styled(BaseTitle)`
  margin-top: 22px;
  font-size: clamp(2rem, 4vw, 3.8rem);
`

export const VipText = styled.p`
  max-width: 44ch;
  margin-top: 20px;
  color: var(--on-ink-muted);
`

export const VipActions = styled.div`
  display: grid;
  justify-items: start;
  gap: 14px;
`

export const VipNote = styled.span`
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--on-ink-faint);
`
