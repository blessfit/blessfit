import { motion, useScroll, useTransform } from 'motion/react'
import { useId } from 'react'
import { Monogram } from './Logo'
import './RotatingBadge.css'

const R = 76
const CIRCUMFERENCE = 2 * Math.PI * R

/** Selo circular com "Faith · Strength · Purpose" que gira com o scroll. */
export function RotatingBadge({ className = '', text = 'Faith · Strength · Purpose · ' }) {
  const id = `ring-${useId().replace(/[^\w-]/g, '')}`
  const { scrollY } = useScroll()
  const rotate = useTransform(scrollY, (v) => v * 0.12)

  return (
    <div className={`badge ${className}`}>
      <motion.div className="badge__scroll" style={{ rotate }} aria-hidden="true">
        <svg className="badge__ring" viewBox="0 0 200 200">
          <defs>
            <path id={id} d={`M100,100 m-${R},0 a${R},${R} 0 1,1 ${R * 2},0 a${R},${R} 0 1,1 -${R * 2},0`} />
          </defs>
          <text>
            <textPath href={`#${id}`} textLength={CIRCUMFERENCE - 8} lengthAdjust="spacing">
              {text.toUpperCase()}
            </textPath>
          </text>
        </svg>
      </motion.div>
      <span className="badge__core">
        <Monogram />
      </span>
    </div>
  )
}
