import { css } from 'styled-components'

/** Recorte em arco, como nas peças da marca. */
export const arch = css`
  border-radius: 1000px 1000px 0 0;
  overflow: hidden;
`

/** Palavra de destaque em caligrafia. */
export const scriptAccent = css`
  font-family: var(--font-script);
  font-style: normal;
  font-weight: 400;
  font-size: 1.5em;
  line-height: 0.5;
  letter-spacing: 0;
  color: var(--accent);
  padding-right: 0.04em;
`

export const script = css`
  font-family: var(--font-script);
  font-weight: 400;
  letter-spacing: 0;
`

/** Rótulo pequeno em caixa alta (eyebrows, numerações, legendas). */
export const label = css`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`

/** Carrossel horizontal com scroll-snap e sem barra de rolagem. */
export const snapScroller = css`
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--gutter);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

/** Bloco que abre/fecha animando a altura (grid 0fr → 1fr). O filho direto é o conteúdo. */
export const collapsible = (open: boolean) => css`
  display: grid;
  grid-template-rows: ${open ? '1fr' : '0fr'};

  & > div {
    min-height: 0;
    overflow: hidden;
  }
`

export const srOnly = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`
