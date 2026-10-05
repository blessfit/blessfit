import { useState } from 'react'
import { ArrowUpRight, Eyebrow, Muted, Plus, Section, TextLink, Title } from '@/components/ui'
import { FAQ } from '@/data/site'
import { external, whatsappUrl } from '@/lib/links'
import * as S from './Faq.styles'

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <Section id="faq" $tone="cream" aria-labelledby="faq-title">
      <S.Grid>
        <S.Intro>
          <Eyebrow>Dúvidas</Eyebrow>
          <Title id="faq-title">
            Perguntas <em>frequentes</em>
          </Title>
          <Muted>Não encontrou o que procurava? Fale com a gente pelo WhatsApp.</Muted>
          <TextLink href={whatsappUrl('Olá! Tenho uma dúvida sobre a blessfit.')} {...external}>
            Chamar no WhatsApp
            <ArrowUpRight />
          </TextLink>
        </S.Intro>

        <S.List>
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <S.Item key={item.q}>
                <h3>
                  <S.Question
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <S.Icon $open={isOpen} aria-hidden="true">
                      <Plus />
                    </S.Icon>
                  </S.Question>
                </h3>
                <S.Answer
                  id={`faq-a-${i}`}
                  $open={isOpen}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  inert={!isOpen}
                >
                  <div>
                    <p>{item.a}</p>
                  </div>
                </S.Answer>
              </S.Item>
            )
          })}
        </S.List>
      </S.Grid>
    </Section>
  )
}
