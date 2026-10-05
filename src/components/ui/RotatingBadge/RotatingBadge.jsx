import { useScroll, useTransform } from 'motion/react'
import { useId } from 'react'
import { Monogram } from '../Logo'
import * as S from './RotatingBadge.styles'

const R = 76
const CIRCUMFERENCE = 2 * Math.PI * R

/** Selo circular com "Faith · Strength · Purpose" que gira com o scroll. */
export function RotatingBadge({ className, text = 'Faith · Strength · Purpose · ' }) {
  const id = `ring-${useId().replace(/[^\w-]/g, '')}`
  const { scrollY } = useScroll()
  const rotate = useTransform(scrollY, (v) => v * 0.12)

  return (
    <S.Root className={className}>
      <S.ScrollLayer style={{ rotate }} aria-hidden="true">
        <S.Ring viewBox="0 0 200 200">
          <defs>
            <path id={id} d={`M100,100 m-${R},0 a${R},${R} 0 1,1 ${R * 2},0 a${R},${R} 0 1,1 -${R * 2},0`} />
          </defs>
          <text>
            <textPath href={`#${id}`} textLength={CIRCUMFERENCE - 8} lengthAdjust="spacing">
              {text.toUpperCase()}
            </textPath>
          </text>
        </S.Ring>
      </S.ScrollLayer>
      <S.Core>
        <Monogram />
      </S.Core>
    </S.Root>
  )
}
