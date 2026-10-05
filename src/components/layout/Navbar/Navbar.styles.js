import { motion } from 'motion/react'
import styled, { css } from 'styled-components'
import { Button, ButtonIcon, Container } from '@/components/ui'
import { media } from '@/styles/media'

export const Header = styled(motion.header)`
  position: fixed;
  inset: 0 0 auto;
  z-index: 80;
  height: var(--header-h);
  border-bottom: 1px solid transparent;
  transition:
    background-color 0.5s var(--ease),
    border-color 0.5s var(--ease),
    backdrop-filter 0.5s var(--ease);

  ${({ $solid }) =>
    $solid &&
    css`
      background: rgb(5 5 14 / 0.72);
      border-bottom-color: var(--line-ink);
      -webkit-backdrop-filter: blur(16px) saturate(140%);
      backdrop-filter: blur(16px) saturate(140%);
    `}
`

export const Inner = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 100%;
`

export const Logo = styled.a`
  display: block;
  color: var(--cream);

  svg {
    width: auto;
    height: 24px;
  }
`

export const Links = styled.nav`
  display: flex;
  gap: clamp(20px, 2.6vw, 44px);

  ${media.md} {
    display: none;
  }
`

export const Link = styled.a`
  position: relative;
  padding: 8px 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--on-ink-muted);
  transition: color 0.3s var(--ease);

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 2px;
    height: 1px;
    background: var(--mint);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.5s var(--ease);
  }

  &:hover {
    color: var(--cream);
  }

  &:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const Cta = styled(Button)`
  ${ButtonIcon} {
    width: 15px;
    height: 15px;
  }

  &:hover ${ButtonIcon} {
    transform: translate(2px, -2px);
  }

  ${media.xs} {
    display: none;
  }
`

export const Burger = styled.button`
  display: none;
  position: relative;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line-ink);
  border-radius: 50%;

  span {
    position: absolute;
    left: 13px;
    right: 13px;
    height: 1.5px;
    background: var(--cream);
    transition:
      transform 0.5s var(--ease),
      top 0.5s var(--ease);
  }

  span:first-child {
    top: 17px;
  }

  span:last-child {
    top: 25px;
  }

  &[aria-expanded='true'] span:first-child {
    top: 21px;
    transform: rotate(45deg);
  }

  &[aria-expanded='true'] span:last-child {
    top: 21px;
    transform: rotate(-45deg);
  }

  ${media.md} {
    display: block;
  }
`

/* ---------- menu mobile ---------- */

export const Menu = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: calc(var(--header-h) + 40px) var(--gutter) 32px;
  background: var(--ink);
`

export const MenuLinks = styled.nav`
  display: flex;
  flex-direction: column;
`

export const MenuLink = styled(motion.a)`
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 6px 0;
  font-size: clamp(2.5rem, 11vw, 3.6rem);
  font-weight: 200;
  line-height: 1.15;
  letter-spacing: -0.03em;

  small {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: var(--mint);
  }
`

export const MenuFoot = styled(motion.div)`
  display: grid;
  gap: 18px;
  padding-top: 24px;
  border-top: 1px solid var(--line-ink);
`

export const MenuSocial = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;

  a {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--on-ink-muted);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

export const MenuVerse = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--on-ink-faint);
`
