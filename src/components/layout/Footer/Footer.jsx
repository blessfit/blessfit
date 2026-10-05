import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Button, Container, Grain, Monogram, Muted, WhatsApp, Wordmark } from '@/components/ui'
import { NAV, SITE } from '@/data/site'
import { external, instagramUrl, whatsappUrl } from '@/lib/links'
import * as S from './Footer.styles'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <S.Root>
      <Grain $behind />
      <Container>
        <S.Cta>
          <S.Slogan>
            Seu treino,
            <br />
            com mais liberdade.
          </S.Slogan>
          <Button variant="cream" glyph={WhatsApp} href={whatsappUrl()} {...external}>
            Comprar pelo WhatsApp
          </Button>
        </S.Cta>

        <S.Cols>
          <S.Brand>
            <S.Badge>
              <Monogram />
            </S.Badge>
            <Muted>
              Moda fitness com propósito. Conforto, performance e estilo para quem treina com fé, força e
              propósito.
            </Muted>
          </S.Brand>

          <S.Col as="nav" aria-label="Rodapé">
            <S.Heading>Navegue</S.Heading>
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </S.Col>

          <S.Col>
            <S.Heading>Fale com a gente</S.Heading>
            <a href={whatsappUrl()} {...external}>
              WhatsApp
            </a>
            <a href={instagramUrl} {...external}>
              Instagram @{SITE.instagram}
            </a>
          </S.Col>
        </S.Cols>

        <FooterMark />

        <S.Bottom>
          <span>© {year} blessfit. Todos os direitos reservados.</span>
          <span>
            {SITE.tagline} — {SITE.verseRef}
          </span>
        </S.Bottom>
      </Container>
    </S.Root>
  )
}

function FooterMark() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['55%', '0%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [0, 1, 1])

  return (
    <S.Mark ref={ref} aria-hidden="true">
      <motion.div style={{ y, opacity }}>
        <Wordmark />
      </motion.div>
    </S.Mark>
  )
}
