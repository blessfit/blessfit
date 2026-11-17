import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ANNOUNCEMENTS } from '@/data/shop'
import { PROMO_SHORT, useTimeLeft } from '@/sections/BlackFriday'
import { useCampaign } from '@/store/campaignContext'

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

  strong {
    font-weight: 800;
    letter-spacing: 0.1em;
  }
`

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Faixa de benefícios no topo (frete grátis, parcelas, Pix). Troca de mensagem sozinha.
 * Na Black Friday, a primeira mensagem é a promoção e a segunda a contagem regressiva.
 */
export function AnnouncementBar() {
  const { active: blackFriday, endsAt } = useCampaign()
  const time = useTimeLeft(blackFriday ? endsAt : null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const messages = blackFriday
    ? [
        <>
          <strong>BLACK FRIDAY</strong> · {PROMO_SHORT}
        </>,
        ...(endsAt
          ? [<>Termina em {time ? `${time.d}d ${pad(time.h)}h ${pad(time.m)}m ${pad(time.s)}s` : '…'}</>]
          : []),
        // sem a mensagem de frete grátis: na Black Friday não há frete grátis por valor
        ...ANNOUNCEMENTS.filter((text) => !/frete grátis/i.test(text)),
      ]
    : ANNOUNCEMENTS
  const count = messages.length

  useEffect(() => {
    if (paused || count < 2) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), 4500)
    return () => window.clearInterval(timer)
  }, [paused, count])

  return (
    <Bar
      role="region"
      aria-label={blackFriday ? 'Black Friday' : 'Benefícios'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {messages.map((text, i) => (
        <Message key={i} $active={i === index % count} aria-hidden={i !== index % count}>
          {text}
        </Message>
      ))}
    </Bar>
  )
}
