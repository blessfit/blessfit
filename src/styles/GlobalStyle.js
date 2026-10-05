import { createGlobalStyle } from 'styled-components'
import { theme } from './theme'

const toVars = (prefix, tokens) =>
  Object.entries(tokens)
    .map(([key, value]) => `--${prefix}${key}: ${value};`)
    .join('\n')

export const GlobalStyle = createGlobalStyle`
  :root {
    ${toVars('', theme.colors)}
    ${toVars('font-', theme.fonts)}
    ${toVars('', theme.easings)}
    ${toVars('', theme.layout)}

    /* cor de destaque e texto secundário do contexto (sobrescritos nas seções claras) */
    --accent: var(--mint);
    --muted: var(--on-ink-muted);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  html.is-locked {
    overflow: hidden;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: var(--ink);
    color: var(--cream);
    font-family: var(--font-sans);
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.65;
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
  blockquote {
    margin: 0;
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

  button {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
  }

  ::selection {
    background: var(--mint);
    color: var(--ink);
  }

  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
    border-radius: 4px;
  }

  main:focus {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`
