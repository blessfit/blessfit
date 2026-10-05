import styled from 'styled-components'
import { Script } from '@/components/ui'
import { media } from '@/styles/media'

export const Root = styled.footer`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-top: clamp(80px, 10vw, 150px);
  background: var(--ink);
`

export const Cta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: clamp(48px, 6vw, 80px);
  border-bottom: 1px solid var(--line-ink);
`

export const Slogan = styled(Script)`
  font-size: clamp(3.4rem, 7vw, 6.6rem);
  line-height: 0.82;
  color: var(--cream);
`

export const Cols = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.8fr);
  gap: 40px;
  padding-block: clamp(48px, 6vw, 72px);

  ${media.md} {
    grid-template-columns: 1fr 1fr;
  }
`

export const Brand = styled.div`
  align-content: start;
  display: grid;
  justify-items: start;
  gap: 22px;
  max-width: 36ch;

  ${media.md} {
    grid-column: 1 / -1;
  }
`

export const Badge = styled.span`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--cream);
  color: var(--ink);

  svg {
    width: 56%;
    height: auto;
  }
`

export const Col = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;

  a {
    padding: 6px 0;
    color: var(--on-ink-muted);
    transition: color 0.3s var(--ease);
  }

  a:hover {
    color: var(--cream);
  }
`

export const Heading = styled.h2`
  margin-bottom: 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--on-ink-faint);
`

export const Mark = styled.div`
  overflow: hidden;
  color: var(--cream);

  svg {
    width: 100%;
    height: auto;
  }
`

export const Bottom = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 24px;
  padding-block: 28px 36px;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--on-ink-faint);
`
