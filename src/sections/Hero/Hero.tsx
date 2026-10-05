import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { ArrowRight, Button, Grain, RotatingBadge, TextLink } from '@/components/ui'
import { HERO, SITE } from '@/data/site'
import { EASE, EASE_IO } from '@/lib/ease'
import * as S from './Hero.styles'

const LINES = ['Movimento', 'também é']

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])
  const fade = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0, 0])
  const yMain = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const ySecond = useTransform(scrollYProgress, [0, 1], ['0%', '-26%'])

  // entrada em sequência, disparada quando a abertura termina
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 26 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.1, ease: EASE, delay },
  })
  const rise = (delay: number) => ({
    initial: { y: '115%' },
    animate: ready ? { y: '0%' } : undefined,
    transition: { duration: 1.2, ease: EASE, delay },
  })

  return (
    <S.Root id="top" ref={ref} aria-labelledby="hero-title">
      <S.Bg aria-hidden="true" />
      <Grain />

      <S.Grid>
        <S.Text style={{ y: yText, opacity: fade }}>
          <S.Eyebrow as={motion.p} {...enter(0.1)}>
            Coleção Essenciais
          </S.Eyebrow>

          <S.Title id="hero-title">
            {LINES.map((line, i) => (
              <S.Line key={line}>
                <motion.span {...rise(0.18 + i * 0.1)}>{line}</motion.span>
              </S.Line>
            ))}
            <S.Line $accent>
              <S.Accent {...rise(0.38)}>
                propósito.
                <S.Swash viewBox="0 0 320 30" preserveAspectRatio="none" aria-hidden="true">
                  <motion.path
                    d="M4 22C70 10 170 4 316 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={ready ? { pathLength: 1 } : undefined}
                    transition={{ duration: 1.3, ease: EASE, delay: 1.2 }}
                  />
                </S.Swash>
              </S.Accent>
            </S.Line>
          </S.Title>

          <S.Lead as={motion.p} {...enter(0.6)}>
            Roupas fitness para quem treina com fé, força e propósito. Conforto, performance e estilo — do
            treino ao dia a dia.
          </S.Lead>

          <S.Ctas {...enter(0.72)}>
            <Button href="#colecao" variant="cream" icon={ArrowRight}>
              Ver coleção
            </Button>
            <TextLink href="#proposito">Nosso propósito</TextLink>
          </S.Ctas>
        </S.Text>

        <S.Visual>
          <S.MainFigure style={{ y: yMain }}>
            <S.ImageReveal
              initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={ready ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
              transition={{ duration: 1.5, ease: EASE_IO, delay: 0.2 }}
            >
              <motion.img
                src={HERO.main.src}
                alt={HERO.main.alt}
                fetchPriority="high"
                initial={{ scale: 1.3 }}
                animate={ready ? { scale: 1 } : undefined}
                transition={{ duration: 2, ease: EASE, delay: 0.2 }}
              />
            </S.ImageReveal>
          </S.MainFigure>

          <S.SecondFigure style={{ y: ySecond }}>
            <S.ImageReveal
              initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
              animate={ready ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
              transition={{ duration: 1.4, ease: EASE_IO, delay: 0.55 }}
            >
              <img src={HERO.second.src} alt={HERO.second.alt} />
            </S.ImageReveal>
          </S.SecondFigure>

          <S.Badge
            initial={{ scale: 0, rotate: -120 }}
            animate={ready ? { scale: 1, rotate: 0 } : undefined}
            transition={{ duration: 1.3, ease: EASE, delay: 0.9 }}
          >
            <RotatingBadge />
          </S.Badge>

          <S.Note
            as={motion.p}
            aria-hidden="true"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1.2, ease: EASE, delay: 1.3 }}
          >
            Seu treino,
            <br />
            com mais liberdade.
          </S.Note>
        </S.Visual>
      </S.Grid>

      <S.FootWrap style={{ opacity: fade }}>
        <S.Foot
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <span>{SITE.verseRef}</span>
          <S.ScrollCue href="#manifesto" aria-label="Rolar para o manifesto">
            <span />
          </S.ScrollCue>
          <span>{SITE.tagline}</span>
        </S.Foot>
      </S.FootWrap>
    </S.Root>
  )
}
