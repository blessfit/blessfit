import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ANNOUNCEMENTS } from '@/data/shop'

const Bar = styled.div`
  position: relative;
  height: 38px;
  background: var(--ink);
  color: var(--white);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  overflow: hidden;
`

const Message = styled.p<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding-inline: 16px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transform: translateY(${({ $active }) => ($active ? '0' : '8px')});
  transition:
    opacity 0.5s var(--ease),
    transform 0.5s var(--ease);
`

/** Faixa de benefícios no topo (frete grátis, parcelas, Pix). Troca de mensagem sozinha. */
export function AnnouncementBar() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || ANNOUNCEMENTS.length < 2) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 4500)
    return () => window.clearInterval(timer)
  }, [paused])

  return (
    <Bar
      role="region"
      aria-label="Benefícios"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {ANNOUNCEMENTS.map((text, i) => (
        <Message key={text} $active={i === index} aria-hidden={i !== index}>
          {text}
        </Message>
      ))}
    </Bar>
  )
}
