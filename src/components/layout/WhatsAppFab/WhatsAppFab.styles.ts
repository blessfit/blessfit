import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  from {
    opacity: 0.9;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.7);
  }
`

export const Fab = styled.a<{ $visible: boolean }>`
  position: fixed;
  right: clamp(16px, 2.4vw, 32px);
  bottom: calc(clamp(16px, 2.4vw, 32px) + env(safe-area-inset-bottom));
  z-index: 40;
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--petrol);
  color: var(--white);
  box-shadow: 0 14px 36px rgb(11 11 15 / 0.28);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: scale(${({ $visible }) => ($visible ? 1 : 0.4)});
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition:
    opacity 0.4s var(--ease),
    transform 0.4s var(--ease),
    background 0.3s;

  &:hover {
    background: var(--petrol-deep);
  }

  svg {
    width: 26px;
    height: 26px;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid var(--petrol);
    border-radius: 50%;
    animation: ${pulse} 2.8s var(--ease) infinite;
  }
`
