import styled from 'styled-components'

/* ——— Menu ——— */

export const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-height: 100%;
  padding: 24px;
`

export const MenuLinks = styled.ul`
  a {
    display: block;
    padding: 12px 0;
    border-bottom: 1px solid var(--line);
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }
`

export const MenuGroup = styled.div`
  h3 {
    margin-bottom: 10px;
    color: var(--text-faint);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  a {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 16px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
  }
`

export const MenuFoot = styled.div`
  display: grid;
  gap: 10px;
  margin-top: auto;

  p {
    margin-top: 8px;
    color: var(--text-faint);
    font-size: 12px;
    text-align: center;
  }
`

/* ——— Sacola ——— */

export const Empty = styled.div`
  display: grid;
  justify-items: center;
  gap: 20px;
  padding: 64px 24px;
  color: var(--text-muted);
  text-align: center;
`

export const Lines = styled.ul`
  padding: 8px 24px;
`

const checkbox = `
  width: 20px;
  height: 20px;
  margin: 0;
  accent-color: var(--petrol);
  cursor: pointer;
`

export const SelectAll = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
  font-weight: 700;

  input {
    ${checkbox}
  }
`

/** `$muted`: item desmarcado ou com quantidade 0 — fica salvo, mas fora do pedido. */
export const Line = styled.li<{ $muted?: boolean }>`
  display: grid;
  grid-template-columns: 20px 88px 1fr auto;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);

  > :not(:first-child) {
    opacity: ${({ $muted }) => ($muted ? 0.55 : 1)};
    transition: opacity 0.2s var(--ease);
  }
`

export const Check = styled.label`
  display: flex;
  padding-top: 2px;

  input {
    ${checkbox}
  }
`

export const Thumb = styled.div`
  aspect-ratio: 4 / 5;
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface);
`

export const LineName = styled.p`
  font-weight: 700;
  line-height: 1.3;
`

export const LineMeta = styled.p`
  color: var(--text-muted);
  font-size: 13px;
`

/** Peça que entrou sem tamanho (“comprar o look”): a escolha fica em destaque, fora do esmaecido. */
export const PickSize = styled.div`
  margin-block: 10px 6px;

  legend {
    color: var(--petrol-deep);
    font-weight: 700;
  }
`

export const NeedSize = styled.p`
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--mint-soft);
  color: var(--petrol-deep);
  font-size: 13px;
  font-weight: 600;
`

export const Qty = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-top: 10px;
  border: 1px solid var(--line);
  border-radius: 999px;

  svg {
    width: 16px;
    height: 16px;
  }

  span {
    min-width: 20px;
    font-size: 14px;
    font-weight: 700;
    text-align: center;
  }
`

export const LineEnd = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;

  strong {
    font-size: 14px;
  }
`

export const TextButton = styled.button`
  margin-top: 10px;
  min-height: 32px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
`

export const Summary = styled.div`
  display: grid;
  gap: 8px;
`

export const Shipping = styled.div`
  margin-bottom: 8px;
  font-size: 13px;

  span {
    position: relative;
    display: block;
    height: 4px;
    margin-top: 8px;
    border-radius: 4px;
    background: var(--line);
    overflow: hidden;
  }

  i {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--petrol);
    transition: width 0.4s var(--ease);
  }
`

export const Total = styled.p`
  display: flex;
  justify-content: space-between;
  font-size: 15px;

  strong {
    font-size: 1.2rem;
  }
`

export const Pix = styled.p`
  margin: -6px 0 8px;
  color: var(--petrol);
  font-size: 13px;
  font-weight: 650;
  text-align: right;
`

/** Alternativa discreta embaixo do botão de finalizar. */
export const Alt = styled.p`
  margin-top: -4px;
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;

  a {
    color: var(--text);
    font-weight: 600;
    text-decoration: underline;
  }
`
