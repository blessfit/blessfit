import styled from 'styled-components'
import { IconButton } from '@/components/ui'
import { media } from '@/styles/media'

export const Root = styled.header<{ $scrolled: boolean }>`
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgb(255 255 255 / 0.96);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--line);
  box-shadow: ${({ $scrolled }) => ($scrolled ? '0 8px 30px rgb(11 11 15 / 0.06)' : 'none')};
  transition: box-shadow 0.3s;
`

export const Top = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  max-width: var(--container);
  height: var(--header-h);
  margin-inline: auto;
  padding-inline: var(--gutter);

  ${media.md} {
    height: 64px;
    gap: 8px;
  }
`

export const Left = styled.div`
  display: flex;
  align-items: center;
`

export const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`

export const Logo = styled.a`
  display: block;
  color: var(--ink);

  svg {
    width: clamp(112px, 11vw, 150px);
    height: auto;
  }
`

export const MenuButton = styled(IconButton)`
  margin-left: -10px;

  ${media.desktop} {
    display: none;
  }
`

export const Account = styled(IconButton)``

export const DesktopSearch = styled.div`
  width: min(100%, 320px);

  ${media.md} {
    display: none;
  }
`

export const MobileSearch = styled.div`
  padding: 0 var(--gutter) 12px;

  ${media.desktop} {
    display: none;
  }
`

export const Nav = styled.nav`
  border-top: 1px solid var(--line);

  ul {
    display: flex;
    justify-content: center;
    gap: clamp(24px, 3.6vw, 56px);
  }

  a {
    position: relative;
    display: flex;
    align-items: center;
    height: 48px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 10px;
      height: 2px;
      background: var(--petrol);
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.4s var(--ease);
    }

    &:hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }
  }

  ${media.md} {
    display: none;
  }
`

/* ——— Busca ——— */

export const Search = styled.form`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  > svg {
    position: absolute;
    left: 16px;
    width: 18px;
    height: 18px;
    color: var(--text-muted);
    pointer-events: none;
  }

  input {
    width: 100%;
    height: 44px;
    padding: 0 16px 0 44px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--paper);
    font-size: 14px;
    transition:
      border-color 0.2s,
      background 0.2s;

    &::placeholder {
      color: var(--text-faint);
    }

    &:hover {
      border-color: var(--line-strong);
    }

    &:focus {
      outline: none;
      border-color: var(--ink);
      background: var(--white);
    }
  }
`

export const Results = styled.ul`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 10;
  min-width: 300px;
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--white);
  box-shadow: var(--shadow);
`

export const Result = styled.button`
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  text-align: left;

  &:hover,
  &:focus-visible {
    background: var(--paper);
  }

  > span:first-child {
    width: 48px;
    height: 56px;
    border-radius: 6px;
    overflow: hidden;
  }

  strong {
    display: block;
    font-size: 14px;
  }

  small {
    color: var(--text-muted);
    font-size: 12px;
  }

  b {
    font-size: 13px;
  }
`

export const Empty = styled.li`
  padding: 12px;
  color: var(--text-muted);
  font-size: 14px;
`
