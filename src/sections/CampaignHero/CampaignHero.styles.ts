import styled from 'styled-components'
import { media } from '@/styles/media'

export const Root = styled.section`
  padding: clamp(10px, 1.2vw, 20px) clamp(10px, 1.2vw, 20px) 0;
`

export const Banner = styled.div`
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  min-height: clamp(540px, calc(100svh - 180px), 820px);
  border-radius: clamp(14px, 1.6vw, 24px);
  overflow: hidden;
  background: var(--ink);
  color: var(--white);

  /* escurece a esquerda (e a base no celular) para o texto ter contraste */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      linear-gradient(90deg, rgb(20 25 12 / 0.82) 0%, rgb(20 25 12 / 0.5) 42%, rgb(20 25 12 / 0) 72%),
      linear-gradient(0deg, rgb(20 25 12 / 0.55) 0%, rgb(20 25 12 / 0) 40%);
  }

  ${media.sm} {
    min-height: calc(100svh - 190px);
    max-height: 760px;

    &::after {
      background: linear-gradient(0deg, rgb(20 25 12 / 0.9) 0%, rgb(20 25 12 / 0.55) 48%, rgb(20 25 12 / 0.1) 75%);
    }
  }
`

export const Media = styled.div`
  position: absolute;
  inset: 0;
  z-index: -2;
`

export const Content = styled.div`
  width: 100%;
  max-width: 760px;
  padding: clamp(28px, 5vw, 80px);
`

export const Eyebrow = styled.p`
  display: inline-block;
  margin-bottom: 20px;
  padding: 7px 14px;
  border: 1px solid rgb(255 255 255 / 0.4);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`

export const Title = styled.h1`
  font-size: clamp(2.6rem, 6.4vw, 6rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.045em;
  text-wrap: balance;
`

export const Text = styled.p`
  max-width: 36ch;
  margin-top: clamp(16px, 2vw, 24px);
  color: rgb(255 255 255 / 0.86);
  font-size: clamp(1.05rem, 1.4vw, 1.25rem);
  font-weight: 500;
  line-height: 1.5;
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: clamp(24px, 3vw, 36px);

  ${media.sm} {
    flex-direction: column;

    a {
      width: 100%;
    }
  }
`

export const Tagline = styled.p`
  position: absolute;
  right: clamp(28px, 4vw, 56px);
  bottom: clamp(28px, 4vw, 56px);
  display: grid;
  justify-items: end;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;

  span {
    color: rgb(255 255 255 / 0.6);
    font-weight: 500;
    letter-spacing: 0.1em;
  }

  ${media.md} {
    display: none;
  }
`
