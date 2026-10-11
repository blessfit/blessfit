import { theme } from './theme'

const { xs, sm, md } = theme.breakpoints

/** Media queries (variáveis CSS não funcionam dentro de @media). */
export const media = {
  /** até 419px */
  xs: `@media (max-width: ${xs - 1}px)`,
  /** celular: até 639px */
  sm: `@media (max-width: ${sm - 1}px)`,
  /** tablet e celular: até 1023px */
  md: `@media (max-width: ${md - 1}px)`,
  /** desktop: a partir de 1024px */
  desktop: `@media (min-width: ${md}px)`,
  /** só dispositivos com mouse (evita hover "grudado" no toque) */
  hover: '@media (hover: hover) and (pointer: fine)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
}

/** Mesma query do `media.desktop`, para usar com useMediaQuery / matchMedia. */
export const DESKTOP_QUERY = `(min-width: ${md}px)`
