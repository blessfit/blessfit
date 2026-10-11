import type { ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { media } from '@/styles/media'

export const SectionEyebrow = styled.p`
  margin-bottom: 12px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
`

export const SectionTitle = styled.h2`
  font-size: clamp(1.9rem, 3.6vw, 3.1rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.035em;
  text-wrap: balance;
`

const Root = styled.header<{ $center?: boolean }>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px 24px;
  margin-bottom: clamp(28px, 4vw, 48px);

  ${({ $center }) =>
    $center &&
    css`
      flex-direction: column;
      align-items: center;
      text-align: center;
    `}

  ${media.sm} {
    flex-direction: column;
    align-items: ${({ $center }) => ($center ? 'center' : 'stretch')};
  }
`

const Text = styled.p`
  max-width: 54ch;
  margin-top: 14px;
  color: var(--muted);
  font-size: clamp(0.95rem, 1.1vw, 1.05rem);
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
`

type SectionHeaderProps = {
  /** id do título (use no aria-labelledby da seção). */
  id?: string
  eyebrow?: string
  title: ReactNode
  text?: ReactNode
  /** Conteúdo à direita (links, abas). */
  actions?: ReactNode
  center?: boolean
}

/** Cabeçalho padrão das seções: chamada, título, texto e ações. */
export function SectionHeader({ id, eyebrow, title, text, actions, center }: SectionHeaderProps) {
  return (
    <Root $center={center}>
      <div>
        {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
        <SectionTitle id={id}>{title}</SectionTitle>
        {text && <Text style={center ? { marginInline: 'auto' } : undefined}>{text}</Text>}
      </div>
      {actions && <Actions>{actions}</Actions>}
    </Root>
  )
}
