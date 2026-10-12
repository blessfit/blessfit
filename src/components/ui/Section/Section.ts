import styled, { css } from 'styled-components'

const tones = {
  white: css`
    background: var(--white);
  `,
  /** creme bem claro, para alternar com as seções brancas */
  paper: css`
    background: var(--paper);
  `,
  /** azul-petróleo profundo (seção “Sobre a Blessfit”) */
  petrol: css`
    --accent: var(--mint);
    --muted: var(--on-ink-muted);
    background: var(--petrol-dark);
    color: var(--cream);
  `,
  ink: css`
    --accent: var(--mint);
    --muted: var(--on-ink-muted);
    background: var(--ink);
    color: var(--cream);
  `,
  cream: css`
    --accent: var(--petrol);
    --muted: var(--on-cream-muted);
    background: var(--cream);
    color: var(--ink);
  `,
}

/** Seção padrão da página. `$tone` define fundo, cor de texto e de destaque. */
export type SectionTone = keyof typeof tones

export const Section = styled.section<{ $tone?: SectionTone }>`
  position: relative;
  padding-block: var(--section-y);
  ${({ $tone }) => $tone && tones[$tone]}
`
