/*
 * Design tokens da blessfit (paleta extraída da identidade visual).
 * O GlobalStyle publica estes valores como variáveis CSS (--ink, --mint, ...),
 * então os componentes usam `var(--token)` e as seções podem sobrescrever o contexto
 * (ex.: --accent e --muted nas seções claras).
 */
export const theme = {
  colors: {
    ink: '#05050e',
    'ink-soft': '#0b0c19',
    'ink-raise': '#14162a',
    cream: '#f2edda',
    'cream-soft': '#e9e2cc',
    sand: '#e4ddd3',
    petrol: '#0a6a82',
    'petrol-deep': '#0e3a43',
    mint: '#a3d4c4',

    'on-ink-muted': 'rgb(242 237 218 / 0.64)',
    'on-ink-faint': 'rgb(242 237 218 / 0.4)',
    'line-ink': 'rgb(242 237 218 / 0.14)',
    'on-cream-muted': 'rgb(5 5 14 / 0.66)',
    'line-cream': 'rgb(5 5 14 / 0.14)',
  },
  fonts: {
    sans: "'Montserrat Variable', 'Montserrat', ui-sans-serif, system-ui, sans-serif",
    script: "'Allison', 'Brush Script MT', cursive",
  },
  // mesmas curvas de lib/ease.js (usadas pelo motion)
  easings: {
    ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
    'ease-io': 'cubic-bezier(0.76, 0, 0.24, 1)',
  },
  layout: {
    container: '1380px',
    gutter: 'clamp(20px, 4.2vw, 64px)',
    'header-h': '76px',
    'section-y': 'clamp(96px, 11vw, 176px)',
    radius: '22px',
  },
  breakpoints: {
    xs: 420,
    sm: 560,
    md: 900,
  },
}
