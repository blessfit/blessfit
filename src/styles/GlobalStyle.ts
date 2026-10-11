import { createGlobalStyle } from 'styled-components'
import { theme } from './theme'

const toVars = (prefix: string, tokens: Record<string, string>) =>
  Object.entries(tokens)
    .map(([key, value]) => `--${prefix}${key}: ${value};`)
    .join('\n')

export const GlobalStyle = createGlobalStyle`
  :root {
    ${toVars('', theme.colors)}
    ${toVars('font-', theme.fonts)}
    ${toVars('', theme.easings)}
    ${toVars('', theme.layout)}

    /* cor de destaque e texto secundário do contexto (sobrescritos nas seções escuras) */
    --accent: var(--petrol);
    --muted: var(--text-muted);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    scroll-behavior: smooth;
    /* âncoras param abaixo do header fixo */
    scroll-padding-top: 132px;
  }

  html.is-locked {
    overflow: hidden;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: var(--white);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 1rem;
    font-weight: 450;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: clip;
  }

  img,
  svg,
  video {
    display: block;
    max-width: 100%;
  }

  img {
    height: auto;
  }

  h1,
  h2,
  h3,
  h4,
  p,
  ul,
  ol,
  figure,
  blockquote,
  fieldset,
  dl,
  dd {
    margin: 0;
  }

  fieldset {
    padding: 0;
    border: 0;
    min-width: 0;
  }

  ul,
  ol {
    padding: 0;
    list-style: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input {
    font: inherit;
    color: inherit;
  }

  button {
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
  }

  ::selection {
    background: var(--sage);
    color: var(--text);
  }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
    border-radius: 4px;
  }

  main:focus {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`
