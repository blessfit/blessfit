import styled, { css } from 'styled-components'

const variants = {
  plain: css`
    color: var(--ink);

    &:hover {
      background: var(--surface);
    }
  `,
  /** Botão branco flutuante (sobre fotos e carrosséis). */
  float: css`
    background: var(--white);
    color: var(--ink);
    box-shadow: 0 6px 20px rgb(11 11 15 / 0.14);

    &:hover {
      background: var(--ink);
      color: var(--white);
    }
  `,
  outline: css`
    border: 1px solid var(--line-strong);
    color: var(--ink);

    &:hover {
      border-color: var(--ink);
      background: var(--ink);
      color: var(--white);
    }
  `,
}

/** Botão redondo só com ícone. Sempre passe `aria-label`. Área de toque mínima de 44px. */
export const IconButton = styled.button<{ $variant?: keyof typeof variants; $size?: number }>`
  position: relative;
  display: inline-grid;
  place-items: center;
  flex: none;
  width: ${({ $size = 44 }) => $size}px;
  height: ${({ $size = 44 }) => $size}px;
  border-radius: 50%;
  transition:
    background 0.3s var(--ease),
    color 0.3s var(--ease),
    border-color 0.3s var(--ease),
    opacity 0.3s var(--ease);

  svg {
    width: 22px;
    height: 22px;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
    pointer-events: none;
  }

  ${({ $variant = 'plain' }) => variants[$variant]}
`

/** Contador (sacola, favoritos) no canto do IconButton. */
export const CountBadge = styled.span`
  position: absolute;
  top: 3px;
  right: 1px;
  display: grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--petrol);
  color: var(--white);
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
`
