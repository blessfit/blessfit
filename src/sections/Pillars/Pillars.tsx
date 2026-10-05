import { useState } from 'react'
import { Container, Eyebrow } from '@/components/ui'
import { PILLARS } from '@/data/site'
import * as S from './Pillars.styles'

export function Pillars() {
  const [active, setActive] = useState(0)

  return (
    <S.Root id="pilares" $tone="ink" aria-labelledby="pillars-title">
      <Container>
        <S.Head>
          <div>
            <Eyebrow>Nossos pilares</Eyebrow>
            <S.Title id="pillars-title">
              Faith&nbsp;· Strength&nbsp;· <em>Purpose</em>
            </S.Title>
          </div>
          <S.Intro>Três palavras que guiam cada peça, cada costura e cada treino.</S.Intro>
        </S.Head>

        <S.Row>
          {PILLARS.map((pillar, i) => {
            const isActive = active === i
            return (
              <S.Pillar
                key={pillar.en}
                tag="article"
                delay={i * 0.12}
                $active={isActive}
                tabIndex={0}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <S.Img $active={isActive} src={pillar.img} alt="" loading="lazy" />
                <S.Content>
                  <S.Num>{String(i + 1).padStart(2, '0')}</S.Num>
                  <S.PillarTitle>{pillar.en}</S.PillarTitle>
                  <S.Pt>{pillar.pt}</S.Pt>
                  <S.Text $active={isActive}>
                    <div>
                      <p>{pillar.text}</p>
                    </div>
                  </S.Text>
                </S.Content>
              </S.Pillar>
            )
          })}
        </S.Row>
      </Container>
    </S.Root>
  )
}
