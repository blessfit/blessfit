import { css } from 'styled-components'

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
