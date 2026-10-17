import styled, { css } from 'styled-components'
import { media } from '@/styles/media'
import { srOnly } from '@/styles/mixins'

/** Página inteira: no celular ocupa a tela; no computador vira um cartão centralizado. */
export const Page = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  background: var(--paper);

  ${media.desktop} {
    align-items: center;
    padding: 40px 16px;
  }
`

export const Card = styled.main`
  width: 100%;
  max-width: 560px;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--paper);

  ${media.desktop} {
    min-height: 760px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: var(--shadow);
  }
`

// ——— Abertura e telas cheias ———

export const Intro = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  padding: max(40px, env(safe-area-inset-top)) 28px max(32px, env(safe-area-inset-bottom));
  background: var(--olive-deep);
  color: var(--cream);
`

export const Brand = styled.div`
  display: grid;
  gap: 6px;

  svg {
    width: 120px;
    height: auto;
  }

  span {
    color: var(--sage);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`

export const IntroTitle = styled.h1`
  font-size: clamp(34px, 9vw, 42px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.02em;
`

export const IntroText = styled.p`
  margin-top: 16px;
  color: var(--on-ink-muted);
  font-size: 16px;
  line-height: 1.5;
`

export const Perks = styled.ul`
  display: grid;
  gap: 12px;
  margin-top: 24px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
    font-weight: 500;
  }

  svg {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    color: var(--sage);
  }
`

const pill = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  transition: background 0.2s var(--ease);
`

export const Primary = styled.button`
  ${pill}
  background: var(--ink);
  color: var(--cream);

  &:hover {
    background: var(--olive-deep);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

export const Light = styled.button`
  ${pill}
  background: var(--cream);
  color: var(--olive-deep);

  &:hover {
    background: var(--white);
  }
`

export const Ghost = styled.button`
  ${pill}
  border: 1.5px solid var(--line-strong);
  background: var(--white);
  color: var(--text);
  font-weight: 600;

  &:hover {
    border-color: var(--text-muted);
  }
`

export const LinkButton = styled.a`
  ${pill}
  background: var(--ink);
  color: var(--cream);

  &:hover {
    background: var(--olive-deep);
  }
`

// ——— Etapas ———

export const Top = styled.header`
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  gap: 12px;
  padding: max(20px, env(safe-area-inset-top)) 24px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--white);

  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  svg {
    width: 92px;
    height: auto;
    color: var(--ink);
  }

  span {
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 600;
  }
`

export const Progress = styled.div<{ $value: number }>`
  height: 6px;
  border-radius: 999px;
  background: var(--line);
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${(p) => p.$value}%;
    height: 100%;
    border-radius: inherit;
    background: var(--ink);
    transition: width 0.4s var(--ease);
  }
`

export const Body = styled.div`
  flex: 1;
  display: grid;
  align-content: start;
  gap: 32px;
  padding: 24px 24px 32px;
`

export const Question = styled.fieldset`
  display: grid;
  gap: 12px;

  legend {
    padding: 0;
    margin-bottom: 12px;
  }
`

export const Heading = styled.h2`
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;

  &:focus {
    outline: none;
  }
`

export const Hint = styled.p`
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 14px;
`

export const Error = styled.p`
  color: #b42318;
  font-size: 14px;
  font-weight: 600;
`

export const Group = styled.p`
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  &[data-new] {
    color: var(--petrol);
  }
`

export const Grid = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols}, minmax(0, 1fr));
  gap: 10px;
`

export const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

/** Pílula de escolha (para quem, liso/estampado, tamanho, atividade). */
export const Choice = styled.button<{ $round?: boolean }>`
  min-height: 48px;
  padding: 0 16px;
  border: 1.5px solid var(--line-strong);
  border-radius: ${(p) => (p.$round ? '999px' : '12px')};
  background: var(--white);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  transition:
    background 0.15s,
    border-color 0.15s;

  &[aria-pressed='true'],
  &[aria-checked='true'] {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--cream);
  }
`

/** Opção de faixa de preço (radio com bolinha). */
export const Radio = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 0 16px;
  border: 1.5px solid var(--line-strong);
  border-radius: 12px;
  background: var(--white);
  font-size: 15px;
  font-weight: 600;
  text-align: left;

  &::before {
    content: '';
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border: 2px solid var(--line-strong);
    border-radius: 50%;
    background: var(--white);
  }

  &[aria-checked='true'] {
    border-color: var(--ink);
  }

  &[aria-checked='true']::before {
    border: 6px solid var(--ink);
  }
`

export const PieceCard = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid var(--line);
  border-radius: 14px;
  background: var(--white);
  text-align: left;
  transition: border-color 0.15s;

  &[aria-pressed='true'] {
    border-color: var(--ink);
  }
`

export const PieceImage = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  background: var(--surface);
  color: var(--text-faint);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  > svg {
    width: 34px;
    height: 34px;
  }
`

export const NewTag = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--petrol);
  color: var(--white);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
`

export const Tick = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--white);

  svg {
    width: 14px;
    height: 14px;
  }
`

export const PieceName = styled.span`
  padding: 10px 12px 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
`

export const Swatch = styled.button<{ $hex: string; $light: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;

  > span:first-child {
    display: grid;
    place-items: center;
    width: 58px;
    height: 58px;
    padding: 3px;
    border: 2.5px solid transparent;
    border-radius: 50%;
    background-clip: content-box;
    background-color: ${(p) => p.$hex};
    box-shadow: inset 0 0 0 3px var(--paper), inset 0 0 0 4px rgb(11 11 15 / 0.12);
    color: ${(p) => (p.$light ? 'var(--text)' : 'var(--white)')};
  }

  &[aria-pressed='true'] > span:first-child {
    border-color: var(--ink);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

export const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;

  input {
    height: 50px;
    padding: 0 14px;
    border: 1.5px solid var(--line-strong);
    border-radius: 12px;
    background: var(--white);
    font-size: 16px; /* 16px: o iPhone não dá zoom ao focar */
    font-weight: 450;
  }

  input:focus {
    border-color: var(--ink);
    outline: none;
  }
`

export const Consent = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: var(--mint-soft);
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;

  input {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin: 1px 0 0;
    accent-color: var(--ink);
  }
`

export const Honeypot = styled.div`
  ${srOnly}
`

export const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 10px;
  padding: 14px 24px max(24px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--line);
  background: var(--white);

  > :last-child {
    flex: 1;
  }
`

// ——— Fim ———

export const Done = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  padding: 32px 28px max(32px, env(safe-area-inset-bottom));
  text-align: center;

  h1 {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  h1:focus {
    outline: none;
  }

  p {
    color: var(--text-muted);
    font-size: 16px;
    line-height: 1.5;
  }
`

export const DoneIcon = styled.span`
  align-self: center;
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--cream);

  svg {
    width: 36px;
    height: 36px;
  }
`

export const Coupon = styled.div`
  display: grid;
  gap: 6px;
  padding: 20px;
  border: 2px dashed var(--ink);
  border-radius: 16px;
  background: var(--cream);

  span {
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  strong {
    color: var(--olive-deep);
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 0.08em;
    user-select: all;
  }
`

export const Small = styled.p`
  color: var(--text-muted);
  font-size: 13px;
`
