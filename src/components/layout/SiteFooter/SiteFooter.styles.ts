import styled from 'styled-components'
import { media } from '@/styles/media'

export const Root = styled.footer`
  background: var(--olive-deep);
  color: var(--cream);
  font-size: 14px;
`

export const Perks = styled.div`
  border-bottom: 1px solid var(--line-ink);

  ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    padding-block: 32px;

    ${media.md} {
      grid-template-columns: repeat(2, 1fr);
    }

    ${media.xs} {
      grid-template-columns: 1fr;
    }
  }

  li {
    display: flex;
    align-items: center;
    gap: 14px;
    color: var(--on-ink-muted);
    font-size: 13px;
  }

  svg {
    flex: none;
    width: 28px;
    height: 28px;
    color: var(--sage);
  }

  strong {
    display: block;
    color: var(--white);
    font-size: 14px;
  }
`

export const Cols = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) repeat(3, minmax(0, 1fr));
  gap: 40px;
  padding-block: clamp(48px, 6vw, 72px);

  ${media.md} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  ${media.sm} {
    grid-template-columns: 1fr 1fr;
  }
`

export const Brand = styled.div`
  display: grid;
  align-content: start;
  gap: 18px;
  max-width: 340px;
  color: var(--on-ink-muted);

  > svg {
    width: 150px;
    height: auto;
    color: var(--white);
  }

  ${media.md} {
    grid-column: 1 / -1;
  }
`

export const Social = styled.div`
  display: flex;
  gap: 10px;

  a {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--line-ink);
    border-radius: 50%;
    color: var(--white);
    transition:
      background 0.3s,
      color 0.3s;

    &:hover {
      background: var(--white);
      color: var(--ink);
    }
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

export const Col = styled.div`
  h3 {
    margin-bottom: 14px;
    color: var(--white);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  ul {
    display: grid;
    gap: 2px;
  }

  a,
  button {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    color: var(--on-ink-muted);
    text-align: left;
    transition: color 0.2s;

    &:hover {
      color: var(--white);
    }
  }
`

export const Payments = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 20px;
  padding-block: 24px;
  border-top: 1px solid var(--line-ink);

  h3 {
    color: var(--on-ink-faint);
    font-size: 12px;
    font-weight: 600;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  li {
    padding: 6px 12px;
    border: 1px solid var(--line-ink);
    border-radius: 6px;
    color: var(--white);
    font-size: 12px;
    font-weight: 700;
  }
`

export const Bottom = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 24px;
  padding-block: 20px 28px;
  border-top: 1px solid var(--line-ink);
  color: var(--on-ink-faint);
  font-size: 12px;
`
