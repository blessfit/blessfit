import styled, { css } from 'styled-components'

const tones = {
  ink: css`
    background: var(--ink);
  `,
  // seções claras: muda a cor de destaque e o texto secundário do contexto
  cream: css`
    --accent: var(--petrol);
    --muted: var(--on-cream-muted);
    background: var(--cream);
    color: var(--ink);
  `,
}

/** Seção padrão da página. `$tone`: 'ink' | 'cream'. */
export type SectionTone = keyof typeof tones

export const Section = styled.section<{ $tone?: SectionTone }>`
  position: relative;
  padding-block: var(--section-y);
  ${({ $tone }) => $tone && tones[$tone]}
`
