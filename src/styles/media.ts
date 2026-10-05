import { theme } from './theme'

const { xs, sm, md } = theme.breakpoints

/** Media queries (variáveis CSS não funcionam dentro de @media). */
export const media = {
  /** até 419px */
  xs: `@media (max-width: ${xs - 1}px)`,
  /** até 559px */
  sm: `@media (max-width: ${sm - 1}px)`,
  /** tablet e mobile: até 899px */
  md: `@media (max-width: ${md - 1}px)`,
  /** desktop: a partir de 900px */
  desktop: `@media (min-width: ${md}px)`,
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
}

/** Mesma query do `media.desktop`, para usar com useMediaQuery / matchMedia. */
export const DESKTOP_QUERY = `(min-width: ${md}px)`
