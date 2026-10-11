import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, Button, ChevronLeft, ChevronRight, Picture } from '@/components/ui'
import { HERO_SLIDES } from '@/data/shop'
import * as S from './CampaignHero.styles'

const AUTOPLAY_MS = 6000

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Banner principal em carrossel, de ponta a ponta da tela: troca sozinho a cada 6s,
 * arrasta no celular (scroll-snap), tem setas laterais e bolinhas de navegação.
 * Pausa com o mouse em cima, com foco do teclado ou com a aba em segundo plano.
 */
export function CampaignHero() {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = HERO_SLIDES.length

  const goTo = useCallback(
    (next: number) => {
      const el = track.current
      if (!el) return
      const target = (next + count) % count
      el.scrollTo({ left: target * el.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    },
    [count],
  )

  // slide atual = posição da rolagem (funciona com setas, bolinhas e arraste)
  useEffect(() => {
    const el = track.current
    if (!el) return
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth))
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (paused || count < 2 || prefersReducedMotion()) return
    const timer = window.setTimeout(() => {
      if (!document.hidden) goTo(index + 1)
    }, AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [index, paused, count, goTo])

  return (
    <S.Root
      role="region"
      aria-roledescription="carrossel"
      aria-label="Campanhas Blessfit"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <S.Track ref={track}>
        {HERO_SLIDES.map((slide, i) => (
          <S.Slide
            key={slide.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${count}`}
            inert={i !== index}
            $align={slide.align}
            style={{ '--focus-mobile': slide.mobileFocus } as CSSProperties}
          >
            <S.Media>
              <Picture image={slide.image} priority={i === 0} eager sizes="100vw" />
            </S.Media>
            <S.Content $align={slide.align}>
              <S.Eyebrow>{slide.eyebrow}</S.Eyebrow>
              <S.Title as={i === 0 ? 'h1' : 'h2'}>{slide.title}</S.Title>
              <S.Text>{slide.text}</S.Text>
              <S.Actions>
                <Button variant="light" icon={ArrowRight} href={slide.primary.href}>
                  {slide.primary.label}
                </Button>
                {slide.secondary && (
                  <Button variant="outlineLight" href={slide.secondary.href}>
                    {slide.secondary.label}
                  </Button>
                )}
              </S.Actions>
            </S.Content>
          </S.Slide>
        ))}
      </S.Track>

      {count > 1 && (
        <>
          <S.Arrow $side="left" $variant="float" type="button" aria-label="Slide anterior" onClick={() => goTo(index - 1)}>
            <ChevronLeft />
          </S.Arrow>
          <S.Arrow $side="right" $variant="float" type="button" aria-label="Próximo slide" onClick={() => goTo(index + 1)}>
            <ChevronRight />
          </S.Arrow>
          <S.Dots>
            {HERO_SLIDES.map((slide, i) => (
              <S.Dot
                key={slide.title}
                type="button"
                aria-label={`Ir para o slide ${i + 1}: ${slide.title}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
              />
            ))}
          </S.Dots>
        </>
      )}
    </S.Root>
  )
}
