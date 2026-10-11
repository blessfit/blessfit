import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from '../Icons'
import * as S from './Carousel.styles'

type CarouselProps = {
  /** Nome acessível do carrossel (ex.: “Lançamentos”). */
  label: string
  children: ReactNode
  /** Cards visíveis por vez no desktop e no tablet (no celular é sempre 1). */
  perView?: { desktop: number; tablet: number }
}

/**
 * Carrossel horizontal com scroll-snap: arrasta no toque, rola no trackpad
 * e tem setas laterais + barra de progresso.
 */
export function Carousel({ label, children, perView = { desktop: 4, tablet: 2 } }: CarouselProps) {
  const track = useRef<HTMLUListElement>(null)
  const [state, setState] = useState({ start: true, end: false, size: 1, offset: 0 })

  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setState({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft >= max - 4,
      size: el.clientWidth / el.scrollWidth,
      offset: el.scrollLeft / el.scrollWidth,
    })
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    el.addEventListener('scroll', update, { passive: true })
    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', update)
    }
  }, [update])

  const go = (direction: 1 | -1) => {
    const el = track.current
    const item = el?.firstElementChild as HTMLElement | null
    if (!el || !item) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: direction * (item.offsetWidth + gap), behavior: 'smooth' })
  }

  const fits = state.start && state.end

  return (
    <S.Root role="region" aria-roledescription="carrossel" aria-label={label}>
      <S.Track ref={track} $desktop={perView.desktop} $tablet={perView.tablet} tabIndex={0}>
        {Children.map(children, (child) => (
          <S.Slide>{child}</S.Slide>
        ))}
      </S.Track>

      {!fits && (
        <>
          <S.Arrow
            $side="left"
            $variant="float"
            type="button"
            aria-label="Produtos anteriores"
            disabled={state.start}
            onClick={() => go(-1)}
          >
            <ChevronLeft />
          </S.Arrow>
          <S.Arrow
            $side="right"
            $variant="float"
            type="button"
            aria-label="Próximos produtos"
            disabled={state.end}
            onClick={() => go(1)}
          >
            <ChevronRight />
          </S.Arrow>
          <S.Progress aria-hidden="true">
            <span style={{ width: `${state.size * 100}%`, left: `${state.offset * 100}%` }} />
          </S.Progress>
        </>
      )}
    </S.Root>
  )
}
