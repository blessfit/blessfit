import styled, { css } from 'styled-components'
import { media } from '@/styles/media'

export const Page = styled.div`
  min-height: 100vh;
  background: var(--paper);
`

export const Top = styled.header`
  background: var(--white);
  border-bottom: 1px solid var(--line);
`

export const TopInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1200px;
  height: 68px;
  margin: 0 auto;
  padding: 0 var(--gutter);

  svg {
    height: 26px;
    width: auto;
    color: var(--ink);
  }
`

export const Secure = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--mint-soft);
  color: var(--success);
  font-size: 12px;
  font-weight: 650;

  svg {
    width: 14px;
    height: 14px;
  }
`

export const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px var(--gutter) 64px;
`

export const Crumbs = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--text-faint);

  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--text);
    font-weight: 600;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 24px;
  align-items: start;

  ${media.md} {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const Steps = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;
`

export const Card = styled.section`
  padding: clamp(18px, 3vw, 28px);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--white);
`

export const StepHead = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;

  h2 {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
  }

  p {
    margin-top: 2px;
    font-size: 13px;
    color: var(--text-muted);
  }
`

export const StepNumber = styled.span`
  display: grid;
  flex: none;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--white);
  font-size: 14px;
  font-weight: 700;
`

export const AccountLine = styled.p`
  margin: -8px 0 18px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-size: 13px;
  color: var(--text-muted);

  strong,
  a {
    color: var(--text);
    font-weight: 650;
  }

  a {
    text-decoration: underline;
  }
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;

  ${media.sm} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export const Field = styled.label<{ $span?: number; $spanSm?: number }>`
  display: grid;
  gap: 6px;
  align-content: start;
  grid-column: span ${({ $span = 6 }) => $span};
  font-size: 13px;
  font-weight: 600;

  ${media.sm} {
    grid-column: span ${({ $spanSm = 2 }) => $spanSm};
  }

  input,
  select {
    width: 100%;
    height: 48px;
    padding: 0 14px;
    border: 1.5px solid var(--line-strong);
    border-radius: var(--radius-sm);
    background: var(--white);
    font: inherit;
    font-size: 16px; /* 16px: o iPhone não dá zoom ao focar */
    font-weight: 450;
  }

  input:focus,
  select:focus {
    border-color: var(--ink);
    outline: none;
  }

  &[data-invalid='true'] input,
  &[data-invalid='true'] select {
    border-color: #c0392b;
  }

  small {
    font-size: 12px;
    font-weight: 500;
    color: #c0392b;
  }
`

export const Required = styled.span`
  color: #c0392b;
`

export const CepRow = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    min-width: 0;
  }
`

export const SmallButton = styled.button`
  flex: none;
  height: 48px;
  padding: 0 18px;
  border-radius: var(--radius-sm);
  background: var(--ink);
  color: var(--white);
  font-size: 13px;
  font-weight: 650;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Placeholder = styled.p`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  border: 1.5px dashed var(--line-strong);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-muted);

  svg {
    flex: none;
    width: 22px;
    height: 22px;
  }
`

export const Options = styled.div`
  display: grid;
  gap: 10px;
`

export const Option = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1.5px solid var(--line-strong);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.2s;

  ${({ $checked }) =>
    $checked &&
    css`
      border-color: var(--ink);
      background: var(--paper);
    `}

  input {
    flex: none;
    width: 18px;
    height: 18px;
    margin: 0;
    accent-color: var(--ink);
  }
`

export const OptionText = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--text-muted);

  strong {
    display: block;
    font-size: 15px;
    color: var(--text);
  }
`

export const OptionPrice = styled.strong<{ $free?: boolean }>`
  flex: none;
  font-size: 15px;
  color: ${({ $free }) => ($free ? 'var(--success)' : 'var(--text)')};
`

export const Tags = styled.span`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`

export const Tag = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--mint-soft);
  color: var(--petrol-deep);
  font-size: 11px;
  font-weight: 650;
`

export const Note = styled.p`
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-faint);
`

export const Aside = styled.aside`
  position: sticky;
  top: 24px;
  display: grid;
  gap: 16px;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--white);

  ${media.md} {
    position: static;
  }
`

export const FreeShipping = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 13px;

  span {
    display: block;
    height: 6px;
    border-radius: 999px;
    background: var(--surface);
    overflow: hidden;
  }

  i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--success);
    transition: width 0.4s var(--ease);
  }
`

export const BagTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 700;

  span {
    padding: 2px 10px;
    border-radius: 999px;
    background: var(--surface);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
  }
`

export const Lines = styled.ul`
  display: grid;
  gap: 14px;
`

export const Line = styled.li`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
`

export const Thumb = styled.div`
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const LineName = styled.p`
  font-size: 13px;
  font-weight: 650;
  line-height: 1.35;
`

export const LineMeta = styled.p`
  font-size: 12px;
  color: var(--text-muted);
`

/** Peça que entrou sem tamanho (“comprar o look”): escolha antes de finalizar. */
export const PickSize = styled.div`
  margin-top: 8px;

  legend {
    color: var(--petrol-deep);
    font-weight: 700;
  }
`

export const Qty = styled.div`
  display: inline-flex;
  align-items: center;
  margin-top: 6px;
  border: 1px solid var(--line-strong);
  border-radius: 8px;

  button {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
  }

  button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }

  span {
    min-width: 24px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
  }
`

export const LineEnd = styled.div`
  display: grid;
  justify-items: end;
  gap: 6px;
  font-size: 14px;

  button {
    color: var(--text-faint);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

export const CouponBox = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: var(--radius-sm);
  background: var(--paper);
  font-size: 13px;
  font-weight: 600;

  input {
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 12px;
    border: 1.5px solid var(--line-strong);
    border-radius: 8px;
    background: var(--white);
    font-size: 16px;
    font-weight: 450;
    text-transform: uppercase;
  }

  input::placeholder {
    text-transform: none;
  }

  input:focus {
    border-color: var(--ink);
    outline: none;
  }
`

export const CouponRow = styled.div`
  display: flex;
  gap: 8px;

  button {
    height: 44px;
  }
`

export const Applied = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--success);

  button {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: underline;
  }
`

export const Error = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: #c0392b;
`

export const Totals = styled.dl`
  display: grid;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  font-size: 14px;

  div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  dt {
    color: var(--text-muted);
  }

  dd {
    font-weight: 600;
  }
`

export const Discount = styled.dd`
  color: var(--success);
`

export const Grand = styled.div`
  display: grid;
  gap: 2px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  text-align: right;

  p:first-child {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 15px;
    font-weight: 700;
  }

  p:first-child strong {
    font-size: 24px;
  }

  p + p {
    font-size: 12px;
    color: var(--text-muted);
  }
`

export const PayOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  ${media.xs} {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const Trust = styled.ul`
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  svg {
    flex: none;
    width: 16px;
    height: 16px;
    color: var(--success);
  }
`

export const Alt = styled.p`
  font-size: 12px;
  text-align: center;
  color: var(--text-muted);

  a {
    font-weight: 600;
    color: var(--text);
    text-decoration: underline;
  }
`

export const Empty = styled.div`
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 64px 24px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--white);
  text-align: center;

  h1 {
    font-size: 20px;
  }

  p {
    color: var(--text-muted);
  }
`
