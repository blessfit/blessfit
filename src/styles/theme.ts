/*
 * Design tokens da Blessfit.
 * O GlobalStyle publica estes valores como variáveis CSS (--ink, --petrol, ...),
 * então os componentes usam `var(--token)`.
 */
export const theme = {
  colors: {
    // marca — verde-oliva é a cor-base (botões, faixas, seleção); petróleo é o destaque
    ink: '#4a5630',
    'ink-soft': '#5c693f',
    'olive-deep': '#2f3820',
    sage: '#c9d3a8',
    'ink-raise': '#14162a',
    petrol: '#0a6a82',
    'petrol-deep': '#0e3a43',
    'petrol-dark': '#082a31',
    cream: '#f2edda',
    'cream-soft': '#e9e2cc',
    sand: '#e4ddd3',
    mint: '#a3d4c4',
    'mint-soft': '#e4f2ed',

    // loja (áreas claras)
    white: '#ffffff',
    paper: '#f7f5f0',
    surface: '#f1efe9',
    text: '#1c2116',
    'text-muted': '#5c6152',
    'text-faint': '#8d8e95',
    line: '#e6e3dc',
    'line-strong': '#cfcbc2',
    success: '#1f7a55',

    // contextos escuros
    'on-ink-muted': 'rgb(242 237 218 / 0.7)',
    'on-ink-faint': 'rgb(242 237 218 / 0.45)',
    'line-ink': 'rgb(242 237 218 / 0.16)',
    'on-cream-muted': 'rgb(11 11 15 / 0.66)',
    'line-cream': 'rgb(11 11 15 / 0.14)',
  },
  fonts: {
    sans: "'Montserrat Variable', 'Montserrat', ui-sans-serif, system-ui, sans-serif",
    script: "'Allison', 'Brush Script MT', cursive",
  },
  easings: {
    ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
    'ease-io': 'cubic-bezier(0.76, 0, 0.24, 1)',
  },
  layout: {
    container: '1440px',
    gutter: 'clamp(16px, 3.4vw, 48px)',
    'header-h': '76px',
    'section-y': 'clamp(64px, 8vw, 120px)',
    radius: '16px',
    'radius-sm': '10px',
    shadow: '0 18px 48px rgb(11 11 15 / 0.12)',
  },
  breakpoints: {
    xs: 420,
    sm: 640,
    md: 1024,
  },
} as const

export type Theme = typeof theme
