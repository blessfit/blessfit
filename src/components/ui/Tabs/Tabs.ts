import styled from 'styled-components'
import { media } from '@/styles/media'

/** Abas em pílula (role="tablist"). */
export const TabList = styled.div`
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: var(--white);
  border: 1px solid var(--line);

  ${media.sm} {
    display: flex;
    width: 100%;
  }
`

/** Aba (role="tab"); a selecionada usa aria-selected="true". */
export const Tab = styled.button`
  min-width: 112px;
  height: 44px;
  padding: 0 20px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  transition:
    background 0.3s var(--ease),
    color 0.3s var(--ease);

  &[aria-selected='true'] {
    background: var(--ink);
    color: var(--white);
  }

  ${media.sm} {
    flex: 1;
    min-width: 0;
    padding: 0 10px;
    letter-spacing: 0.08em;
  }
`
