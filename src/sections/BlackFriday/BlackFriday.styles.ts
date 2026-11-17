import styled, { keyframes } from 'styled-components'
import { media } from '@/styles/media'

/* ---------- Banner ---------- */

export const Hero = styled.section`
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: clamp(520px, 46vw, 720px);
  background: #000;
  color: #fff;
  overflow: hidden;

  /* escurece o lado do texto */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(90deg, rgb(0 0 0 / 0.95) 0%, rgb(0 0 0 / 0.75) 45%, rgb(0 0 0 / 0.1) 100%);
  }

  ${media.sm} {
    align-items: flex-end;
    min-height: 640px;

    &::after {
      background: linear-gradient(0deg, rgb(0 0 0 / 0.96) 0%, rgb(0 0 0 / 0.75) 55%, rgb(0 0 0 / 0.2) 100%);
    }
  }
`

export const Media = styled.div`
  position: absolute;
  inset: 0;
  z-index: -2;

  img {
    filter: grayscale(1) contrast(1.18) brightness(0.82);
  }
`

export const Content = styled.div`
  display: grid;
  justify-items: start;
  width: 100%;
  max-width: 720px;
  padding: clamp(40px, 5vw, 80px) clamp(20px, 7vw, 120px);

  ${media.sm} {
    padding: 40px 20px 48px;
  }
`

export const Eyebrow = styled.p`
  margin-bottom: 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`

export const Title = styled.h1`
  font-size: clamp(4rem, 11vw, 9.5rem);
  font-weight: 900;
  line-height: 0.86;
  letter-spacing: -0.04em;
  text-transform: uppercase;

  span {
    display: block;
    color: transparent;
    -webkit-text-stroke: 2px #fff;
  }
`

export const Text = styled.p`
  max-width: 44ch;
  margin-top: 18px;
  color: rgb(255 255 255 / 0.82);
  font-size: clamp(1rem, 1.3vw, 1.15rem);
  font-weight: 500;
`

export const Countdown = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
`

export const TimeBox = styled.div`
  min-width: 72px;
  padding: 10px 12px 8px;
  border: 1px solid #fff;
  border-radius: 10px;
  background: #000;
  text-align: center;

  b {
    display: block;
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  small {
    color: rgb(255 255 255 / 0.7);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  ${media.xs} {
    min-width: 62px;
  }
`

export const Ladder = styled.ol`
  display: grid;
  grid-template-columns: repeat(var(--steps), minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 440px;
  margin-top: 22px;

  li {
    display: grid;
    gap: 2px;
    padding: 10px 8px 9px;
    border: 1px solid rgb(255 255 255 / 0.35);
    border-radius: 10px;
    background: rgb(0 0 0 / 0.5);
    text-align: center;
  }

  b {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 900;
    line-height: 1;
  }

  span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  li:last-child {
    background: #fff;
    border-color: #fff;
    color: #000;
  }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;

  ${media.sm} {
    flex-direction: column;
    width: 100%;

    a {
      width: 100%;
    }
  }
`

/* ---------- Faixa rolante ---------- */

const slide = keyframes`
  to { transform: translateX(-50%); }
`

export const Ticker = styled.div`
  overflow: hidden;
  background: #000;
  color: #fff;
  border-top: 1px solid rgb(255 255 255 / 0.2);
`

export const TickerTrack = styled.div`
  display: flex;
  width: max-content;
  animation: ${slide} 30s linear infinite;

  span {
    padding: 12px 0;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  span::after {
    content: '✦';
    margin-inline: 22px;
    font-size: 12px;
  }

  ${media.reducedMotion} {
    animation: none;
  }
`

/* ---------- Como funciona ---------- */

export const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(var(--steps), minmax(0, 1fr));
  gap: 14px;

  ${media.sm} {
    grid-template-columns: 1fr;
  }
`

export const Step = styled.div<{ $max?: boolean }>`
  display: grid;
  align-content: start;
  gap: 8px;
  min-width: 0;
  padding: 22px 20px;
  border: 1px solid ${({ $max }) => ($max ? '#000' : 'var(--line)')};
  border-radius: var(--radius);
  background: ${({ $max }) => ($max ? '#000' : 'var(--white)')};
  color: ${({ $max }) => ($max ? '#fff' : 'var(--text)')};

  span {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  b {
    font-size: clamp(2.6rem, 5vw, 3.8rem);
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -0.03em;
  }

  p {
    font-size: 13px;
    opacity: 0.75;
    font-variant-numeric: tabular-nums;
  }
`
