import { useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Grain, Monogram } from '@/components/ui'
import { VERSE } from '@/data/site'
import * as S from './Verse.styles'

/** 1 Coríntios 6:19-20 — o texto fica fixo e "acende" conforme o scroll. */
export function Verse() {
  const ref = useRef<HTMLElement>(null)
  const reduce = Boolean(useReducedMotion())
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const monoScale = useTransform(scrollYProgress, [0, 1], [0.85, 1.12])
  const monoRotate = useTransform(scrollYProgress, [0, 1], [-6, 6])
  const refOpacity = useTransform(scrollYProgress, [0, 0.8, 0.92, 1], [0, 0, 1, 1])
  const refY = useTransform(scrollYProgress, [0, 0.8, 0.92, 1], [16, 16, 0, 0])

  return (
    <S.Root id="proposito" ref={ref} $static={reduce} aria-labelledby="verse-title">
      <S.Sticky $static={reduce}>
        <S.Glow aria-hidden="true" />
        <Grain $behind />
        <S.Mono style={{ scale: monoScale, rotate: monoRotate }} aria-hidden="true">
          <Monogram />
        </S.Mono>

        <S.Inner>
          <S.Eyebrow as="h2" id="verse-title">
            Nosso fundamento
          </S.Eyebrow>
          <blockquote>
            <S.Text segments={VERSE.segments} progress={scrollYProgress} range={[0.06, 0.8]} />
            <S.Ref style={reduce ? undefined : { opacity: refOpacity, y: refY }}>
              <cite>{VERSE.ref}</cite> · {VERSE.version}
            </S.Ref>
          </blockquote>
        </S.Inner>
      </S.Sticky>
    </S.Root>
  )
}
