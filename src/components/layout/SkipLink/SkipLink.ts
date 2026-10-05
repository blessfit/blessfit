import styled from 'styled-components'

/** Atalho de acessibilidade: aparece ao receber foco pelo teclado. */
export const SkipLink = styled.a`
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 200;
  padding: 12px 18px;
  border-radius: 999px;
  background: var(--cream);
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
  transform: translateY(-160%);
  transition: transform 0.4s var(--ease);

  &:focus {
    transform: none;
  }
`
