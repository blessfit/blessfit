import styled from 'styled-components'
import { media } from '@/styles/media'

/** /entrar: "Acesse sua conta" + "Criar uma nova conta", lado a lado no desktop. */
export const Duo = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 24px;
  align-items: start;
  max-width: 960px;
  margin: 0 auto;

  ${media.md} {
    grid-template-columns: minmax(0, 1fr);
    max-width: 560px;
  }
`

export const Narrow = styled.div`
  display: grid;
  gap: 16px;
  max-width: 760px;
  margin: 0 auto;
`

export const Card = styled.section`
  padding: clamp(22px, 4vw, 36px);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--white);
`

export const Title = styled.h1`
  font-size: clamp(22px, 2.6vw, 26px);
  font-weight: 700;
  line-height: 1.2;
`

export const Subtitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
`

export const Lead = styled.p`
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);

  a,
  button {
    color: var(--text);
    font-weight: 650;
    text-decoration: underline;
  }
`

export const Tabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-top: 24px;
  padding: 4px;
  border-radius: var(--radius-sm);
  background: var(--surface);
`

export const Tab = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 650;
  color: ${({ $active }) => ($active ? 'var(--text)' : 'var(--text-muted)')};
  background: ${({ $active }) => ($active ? 'var(--white)' : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? '0 1px 3px rgb(11 11 15 / 0.12)' : 'none')};
  transition:
    background 0.2s,
    color 0.2s;
`

export const Form = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  margin-top: 22px;

  /* campos do checkout trazem span de 6 colunas: aqui cada um ocupa a linha toda */
  > * {
    grid-column: 1 / -1;
  }
`

/** Campo de senha: o botão de mostrar fica dentro do input. */
export const PasswordBox = styled.div`
  position: relative;

  input {
    padding-right: 48px;
  }

  button {
    position: absolute;
    top: 50%;
    right: 6px;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    transform: translateY(-50%);
    color: var(--text-muted);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

export const LabelRow = styled.span`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  button {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: underline;
  }
`

export const Divider = styled.p`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 22px 0 16px;
  font-size: 12px;
  color: var(--text-faint);

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--line);
  }
`

export const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  border: 1.5px solid var(--line-strong);
  border-radius: 999px;
  background: var(--white);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--ink);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

export const Benefits = styled.ul`
  display: grid;
  gap: 14px;
  margin: 24px 0 28px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
  }

  svg {
    flex: none;
    width: 18px;
    height: 18px;
    color: var(--success);
  }
`

export const Notice = styled.p<{ $tone?: 'ok' | 'error' }>`
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: ${({ $tone = 'ok' }) => ($tone === 'ok' ? 'var(--mint-soft)' : '#fbeceb')};
  color: ${({ $tone = 'ok' }) => ($tone === 'ok' ? 'var(--success)' : '#c0392b')};
  font-size: 13px;
  font-weight: 550;
  line-height: 1.5;
`

export const Check = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);

  input {
    flex: none;
    width: 18px;
    height: 18px;
    margin-top: 1px;
    accent-color: var(--ink);
  }
`

export const Hint = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
`

export const FieldError = styled.small`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #c0392b;
`

export const Section = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  /* campos do checkout trazem span de 6 colunas: aqui cada um ocupa a linha toda */
  > * {
    grid-column: 1 / -1;
  }
  gap: 14px;
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
`

export const Orders = styled.ul`
  display: grid;
  margin-top: 16px;

  li + li {
    border-top: 1px solid var(--line);
  }

  a {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 16px;
    padding: 14px 0;
  }

  strong {
    font-size: 14px;
  }

  span {
    font-size: 13px;
    color: var(--text-muted);
  }
`

export const Status = styled.span<{ $tone: 'ok' | 'wait' | 'off' }>`
  justify-self: end;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px !important;
  font-weight: 650;
  background: ${({ $tone }) => ($tone === 'ok' ? 'var(--mint-soft)' : $tone === 'wait' ? 'var(--surface)' : '#fbeceb')};
  color: ${({ $tone }) => ($tone === 'ok' ? 'var(--success)' : $tone === 'wait' ? 'var(--text-muted)' : '#c0392b')} !important;
`

export const Danger = styled.details`
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-muted);

  summary {
    cursor: pointer;
    font-weight: 600;
    text-decoration: underline;
  }

  form {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;

    margin-top: 12px;

    > * {
      grid-column: 1 / -1;
    }
  }
`

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

/** /conta/*: menu da conta à esquerda e a tela (pedidos ou dados) à direita. */
export const AccountLayout = styled.div`
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  align-items: start;

  ${media.md} {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const Side = styled.aside`
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

export const SideNav = styled.nav`
  display: grid;
  gap: 4px;

  a {
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: var(--surface);
      color: var(--text);
    }

    &[aria-current='page'] {
      background: var(--surface);
      color: var(--text);
    }
  }

  /* celular: as duas telas viram abas lado a lado */
  ${media.md} {
    grid-template-columns: 1fr 1fr;
    text-align: center;
  }
`
