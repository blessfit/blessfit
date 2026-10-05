import { motion } from 'motion/react'
import styled, { css, keyframes } from 'styled-components'
import { Container, Eyebrow as BaseEyebrow, Lead as BaseLead, Script } from '@/components/ui'
import { media } from '@/styles/media'
import { arch } from '@/styles/mixins'

export const Root = styled.section`
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  min-height: 100svh;
  padding-top: calc(var(--header-h) + clamp(24px, 4vh, 48px));
  padding-bottom: clamp(132px, 16vh, 168px);
  overflow: hidden;

  ${media.md} {
    min-height: auto;
    padding-bottom: 88px;
  }
`

export const Bg = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(58% 70% at 82% 62%, rgb(10 106 130 / 0.34), transparent 70%),
    radial-gradient(40% 40% at 8% 12%, rgb(163 212 196 / 0.07), transparent 70%),
    var(--ink);
`

export const Grid = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  align-items: center;
  gap: clamp(28px, 4vw, 72px);

  ${media.md} {
    grid-template-columns: 1fr;
  }
`

export const Text = styled(motion.div)``

export const Eyebrow = styled(BaseEyebrow)`
  color: var(--mint);
`

export const Title = styled.h1`
  margin: 26px 0 30px;
  font-size: clamp(3.1rem, 7.6vw, 8.2rem);
  font-weight: 200;
  line-height: 0.98;
  letter-spacing: -0.045em;

  ${media.md} {
    font-size: clamp(3rem, 13.2vw, 5.8rem);
    font-weight: 250;
  }
`

export const Line = styled.span`
  display: block;
  overflow: hidden;
  padding: 0.05em 0 0.02em;

  & > span {
    display: inline-block;
  }

  ${({ $accent }) =>
    $accent &&
    css`
      padding-bottom: 0.24em;
      margin-bottom: -0.16em;
    `}
`

export const Accent = styled(motion.span)`
  position: relative;
  color: var(--mint);
`

export const Swash = styled.svg`
  position: absolute;
  left: 0;
  bottom: -0.14em;
  width: 100%;
  height: 0.22em;
  overflow: visible;
  color: var(--mint);
`

export const Lead = styled(BaseLead)`
  max-width: 30rem;
`

export const Ctas = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px 32px;
  margin-top: 40px;
`

/* ---------- colagem ---------- */

export const Visual = styled.div`
  position: relative;
  height: clamp(460px, 72vh, 760px);

  ${media.md} {
    height: auto;
    aspect-ratio: 1 / 1.16;
    margin-top: 28px;
  }
`

const coverImage = css`
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const MainFigure = styled(motion.figure)`
  ${arch}
  ${coverImage}
  position: absolute;
  top: 0;
  right: 0;
  width: 64%;
  height: 94%;
  background: var(--sand);

  img {
    object-position: 50% 8%;
  }

  ${media.md} {
    width: 70%;
    height: 100%;
  }
`

export const SecondFigure = styled(motion.figure)`
  ${coverImage}
  position: absolute;
  left: 2%;
  bottom: 0;
  width: 40%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 20px;
  background: var(--ink-soft);
  box-shadow:
    0 0 0 8px var(--ink),
    0 30px 60px rgb(0 0 0 / 0.4);

  img {
    object-position: 50% 14%;
  }

  ${media.md} {
    left: 0;
    width: 44%;
  }
`

export const ImageReveal = styled(motion.div)`
  width: 100%;
  height: 100%;
  overflow: hidden;
`

export const Badge = styled(motion.div)`
  position: absolute;
  top: 4%;
  left: 7%;
  width: clamp(104px, 9.5vw, 144px);

  ${media.md} {
    top: 3%;
    left: 1%;
    width: 92px;
  }
`

export const Note = styled(Script)`
  position: absolute;
  right: -1%;
  bottom: -4%;
  font-size: clamp(2.3rem, 3.3vw, 3.4rem);
  line-height: 0.82;
  text-align: right;
  color: var(--cream);
  text-shadow: 0 2px 24px rgb(0 0 0 / 0.55);
  transform: rotate(-7deg);

  ${media.md} {
    right: 1%;
    bottom: -7%;
    font-size: 2.2rem;
  }
`

/* ---------- rodapé do hero ---------- */

export const FootWrap = styled(motion.div)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(56px, 8vh, 84px);

  ${media.md} {
    display: none;
  }
`

export const Foot = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--on-ink-faint);
`

const scrollCue = keyframes`
  0% {
    transform: translateY(-100%);
  }
  60%,
  100% {
    transform: translateY(100%);
  }
`

export const ScrollCue = styled.a`
  display: grid;
  place-items: center;
  width: 44px;
  height: 56px;

  span {
    position: relative;
    display: block;
    width: 1px;
    height: 48px;
    overflow: hidden;
    background: var(--line-ink);
  }

  span::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--mint);
    transform: translateY(-100%);
    animation: ${scrollCue} 2.4s var(--ease-io) infinite;
  }
`
