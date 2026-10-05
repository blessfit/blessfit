import styled from 'styled-components'

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

/** Textura de filme sutil para as seções escuras. `$behind` joga a camada para trás do conteúdo. */
export const Grain = styled.div.attrs({ 'aria-hidden': true })`
  position: absolute;
  inset: 0;
  z-index: ${({ $behind }) => ($behind ? -1 : 'auto')};
  pointer-events: none;
  opacity: 0.06;
  background-image: ${NOISE};
`
