import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Button, Eyebrow } from '@/components/ui'
import { DETAILS } from '@/data/site'
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

  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const trackRef = useRef(null)
  const distance = useMotionValue(0)
  const [height, setHeight] = useState(null)

  useLayoutEffect(() => {
    if (!pinned) {
      distance.set(0)
      return
    }
    const measure = () => {
      const d = Math.max(0, trackRef.current.offsetWidth - window.innerWidth)
      distance.set(d)
      setHeight(d + stickyRef.current.offsetHeight)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(trackRef.current)
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

function DetailsIntro({ pinned = false, progress }) {
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

function DetailCard({ item, index, pinned }) {
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
