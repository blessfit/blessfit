import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Button, Eyebrow } from '@/components/ui'
import { DETAILS, type Detail } from '@/data/site'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { DESKTOP_QUERY } from '@/styles/media'
import * as S from './Details.styles'

/**
 * Desktop: a seção fica fixa e o scroll vertical move a galeria na horizontal.
 * Mobile / movimento reduzido: carrossel com arraste nativo.
 */
export function Details() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const reduce = useReducedMotion()
  const pinned = isDesktop && !reduce

  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const distance = useMotionValue(0)
  const [height, setHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!pinned) {
      distance.set(0)
      return
    }
    const track = trackRef.current
    const sticky = stickyRef.current
    if (!track || !sticky) return
    const measure = () => {
      const d = Math.max(0, track.offsetWidth - window.innerWidth)
      distance.set(d)
      setHeight(d + sticky.offsetHeight)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [pinned, distance])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(() => -scrollYProgress.get() * distance.get())

  return (
    <S.Root
      id="detalhes"
      ref={sectionRef}
      $pinned={pinned}
      style={pinned && height ? { height } : undefined}
      aria-labelledby="details-title"
    >
      <S.Sticky ref={stickyRef} $pinned={pinned}>
        {!pinned && <DetailsIntro />}
        <S.Track ref={trackRef} $pinned={pinned} style={{ x }}>
          {pinned && <DetailsIntro pinned progress={scrollYProgress} />}
          {DETAILS.map((item, i) => (
            <DetailCard key={item.title} item={item} index={i} pinned={pinned} />
          ))}
          {pinned && <DetailsOutro />}
        </S.Track>
      </S.Sticky>
    </S.Root>
  )
}

type DetailsIntroProps = { pinned?: boolean; progress?: MotionValue<number> }

function DetailsIntro({ pinned = false, progress }: DetailsIntroProps) {
  return (
    <S.Intro $pinned={pinned}>
      <Eyebrow>Nos detalhes</Eyebrow>
      <S.Title id="details-title">
        Feito para <em>acompanhar</em> você
      </S.Title>
      <S.Lead>
        Cada costura, alça e cós foi pensado para dar segurança, conforto e liberdade — do primeiro ao último
        movimento.
      </S.Lead>
      {progress && (
        <S.Progress aria-hidden="true">
          <motion.span style={{ scaleX: progress }} />
        </S.Progress>
      )}
    </S.Intro>
  )
}

function DetailCard({ item, index, pinned }: { item: Detail; index: number; pinned: boolean }) {
  return (
    <S.Card $pinned={pinned}>
      <S.CardMedia>
        <img src={item.img} alt={item.alt} loading="lazy" />
      </S.CardMedia>
      <S.Caption>
        <S.Num>{String(index + 1).padStart(2, '0')}</S.Num>
        <div>
          <S.CardTitle>{item.title}</S.CardTitle>
          <S.CardText>{item.text}</S.CardText>
        </div>
      </S.Caption>
    </S.Card>
  )
}

function DetailsOutro() {
  return (
    <S.Outro>
      <S.OutroText>Qualidade que você sente já no primeiro treino.</S.OutroText>
      <Button href="#colecao" variant="lineCream" icon={ArrowRight}>
        Ver coleção
      </Button>
    </S.Outro>
  )
}
