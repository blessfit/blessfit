/*
 * Peças da Black Friday na loja. Só aparecem com a campanha ligada em /admin/campanha.
 */
import type { CSSProperties } from 'react'
import { ArrowRight, Button, Container, Picture, Section, SectionHeader } from '@/components/ui'
import { IMAGES } from '@/data/images'
import { BLOUSE_TIERS, isBlouse } from '@/lib/campaign'
import { formatBRL } from '@/lib/price'
import { useCampaign } from '@/store/campaignContext'
import { useCatalog } from '@/store/catalogContext'
import * as S from './BlackFriday.styles'
import { tierLabel, useTimeLeft } from './promo'

const pad = (n: number) => String(n).padStart(2, '0')

/** Banner principal da Black Friday (no lugar do carrossel). */
export function BlackFridayHero() {
  const { endsAt } = useCampaign()
  const time = useTimeLeft(endsAt)

  return (
    <S.Hero aria-labelledby="bf-title">
      <S.Media>
        <Picture image={IMAGES.heroSlides[0]} priority eager sizes="100vw" decorative />
      </S.Media>
      <S.Content>
        <S.Eyebrow>Black Friday Blessfit · só no site</S.Eyebrow>
        <S.Title id="bf-title">
          Black <span>Friday</span>
        </S.Title>
        <S.Text>Quanto mais blusas, maior o desconto. Vale para tops, regatas e camisetas, no Pix ou no cartão.</S.Text>

        {endsAt && (
          <S.Countdown aria-label="Tempo restante da Black Friday">
            {(
              [
                ['d', 'dias'],
                ['h', 'horas'],
                ['m', 'min'],
                ['s', 'seg'],
              ] as const
            ).map(([key, label]) => (
              <S.TimeBox key={key}>
                <b>{time ? pad(time[key]) : '--'}</b>
                <small>{label}</small>
              </S.TimeBox>
            ))}
          </S.Countdown>
        )}

        <S.Ladder aria-label="Desconto por quantidade de blusas" style={{ '--steps': BLOUSE_TIERS.length } as CSSProperties}>
          {BLOUSE_TIERS.map((tier, i) => (
            <li key={tier.min}>
              <b>{tier.percent}%</b>
              <span>{tierLabel(i)}</span>
            </li>
          ))}
        </S.Ladder>

        <S.Actions>
          <Button variant="light" icon={ArrowRight} href="#blusas">
            Montar meu combo
          </Button>
          <Button variant="outlineLight" href="#categorias">
            Comprar por categoria
          </Button>
        </S.Actions>
      </S.Content>
    </S.Hero>
  )
}

/** Faixa preta rolando com as condições. */
export function BlackFridayTicker() {
  const items = [
    'Black Friday Blessfit',
    ...BLOUSE_TIERS.map((t, i) => `${i === BLOUSE_TIERS.length - 1 ? `${t.min}+` : t.min} blusas ${t.percent}% off`),
    'Vale no Pix e no cartão',
  ]
  return (
    <S.Ticker aria-hidden="true">
      <S.TickerTrack>
        {[...items, ...items].map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </S.TickerTrack>
    </S.Ticker>
  )
}

/** "Quanto mais blusas, maior o desconto": um cartão por degrau, com exemplo na blusa mais barata. */
export function BlackFridaySteps() {
  const { pieces } = useCatalog()
  const blouses = pieces.filter(isBlouse)
  const cheapest = blouses.reduce<(typeof blouses)[number] | undefined>((min, p) => (!min || p.pix < min.pix ? p : min), undefined)

  return (
    // sem espaço embaixo: "Compre por categoria" vem logo depois, também branca, e os dois espaços somavam
    <Section id="black-friday" $tone="white" aria-labelledby="bf-steps-title" style={{ paddingBottom: 0 }}>
      <Container>
        <SectionHeader id="bf-steps-title" eyebrow="Black Friday · desconto progressivo" title="Quanto mais blusas, maior o desconto" />
        <S.Steps style={{ '--steps': BLOUSE_TIERS.length } as CSSProperties}>
          {BLOUSE_TIERS.map((tier, i) => {
            const full = cheapest ? cheapest.pix * tier.min : 0
            const total = Math.round(full * (100 - tier.percent)) / 100
            return (
              <S.Step key={tier.min} $max={i === BLOUSE_TIERS.length - 1}>
                <span>{tierLabel(i)}</span>
                <b>{tier.percent}% off</b>
                {cheapest && (
                  <p>
                    Ex.: {tier.min} {cheapest.name} por <strong>{formatBRL(total)}</strong> no Pix
                  </p>
                )}
              </S.Step>
            )
          })}
        </S.Steps>
      </Container>
    </Section>
  )
}
