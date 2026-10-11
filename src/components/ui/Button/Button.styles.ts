import styled, { css } from 'styled-components'

const variants = {
  /** Preto sólido — ação principal da loja (Comprar). */
  primary: css`
    --btn-hover: var(--olive-deep);
    background: var(--ink);
    color: var(--white);
  `,
  petrol: css`
    --btn-hover: var(--petrol-deep);
    background: var(--petrol);
    color: var(--white);
  `,
  /** Branco sólido — sobre fotos e fundos escuros. */
  light: css`
    --btn-hover: var(--mint);
    background: var(--white);
    color: var(--ink);
  `,
  outline: css`
    --btn-hover: var(--ink);
    border: 1.5px solid var(--ink);
    color: var(--ink);

    &:hover {
      color: var(--white);
    }
  `,
  outlineLight: css`
    --btn-hover: var(--white);
    border: 1.5px solid rgb(255 255 255 / 0.7);
    color: var(--white);

    &:hover {
      color: var(--ink);
      border-color: var(--white);
    }
  `,

  // variantes da versão anterior
  cream: css`
    background: var(--cream);
    color: var(--ink);
  `,
  ink: css`
    --btn-hover: var(--petrol);
    background: var(--ink);
    color: var(--cream);
  `,
  lineInk: css`
    --btn-hover: var(--ink);
    border: 1px solid var(--ink);
    color: var(--ink);

    &:hover {
      color: var(--cream);
    }
  `,
  lineCream: css`
    --btn-hover: var(--cream);
    border: 1px solid rgb(242 237 218 / 0.5);
    color: var(--cream);

    &:hover {
      color: var(--ink);
      border-color: var(--cream);
    }
  `,
}

const sizes = {
  md: css``,
  sm: css`
    --h: 44px;
    padding: 0 20px;
    font-size: 11px;
    letter-spacing: 0.14em;
  `,
}

/** Ícone à esquerda do texto (ex.: WhatsApp). */
export const Glyph = styled.svg`
  width: 18px;
  height: 18px;
  flex: none;
`

/** Ícone à direita do texto (seta) — desliza no hover. */
export const Icon = styled.svg`
  width: 18px;
  height: 18px;
  flex: none;
  transition: transform 0.6s var(--ease);
`

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

export const Root = styled.a<{ $variant: ButtonVariant; $size: ButtonSize; $block?: boolean }>`
  --h: 52px;
  --btn-hover: var(--mint);
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: var(--h);
  padding: 0 28px;
  border-radius: 999px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  transition:
    color 0.5s var(--ease),
    border-color 0.5s var(--ease);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background: var(--btn-hover);
    transform: translateY(101%);
    transition: transform 0.6s var(--ease);
  }

  &:hover::before {
    transform: translateY(0);
  }

  &:hover ${Icon} {
    transform: translateX(4px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  &:disabled::before {
    display: none;
  }

  ${({ $variant }) => variants[$variant]}
  ${({ $size }) => sizes[$size]}
  ${({ $block }) =>
    $block &&
    css`
      display: flex;
      width: 100%;
    `}
`
