import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { VERSE } from '../data/site'
import { Monogram } from './Logo'
import { ScrollLitText } from './Reveal'
import './Verse.css'

/** 1 Coríntios 6:19-20 — o texto fica fixo e "acende" conforme o scroll. */
export function Verse() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const monoScale = useTransform(scrollYProgress, [0, 1], [0.85, 1.12])
  const monoRotate = useTransform(scrollYProgress, [0, 1], [-6, 6])
  const refOpacity = useTransform(scrollYProgress, [0, 0.8, 0.92, 1], [0, 0, 1, 1])
  const refY = useTransform(scrollYProgress, [0, 0.8, 0.92, 1], [16, 16, 0, 0])

  return (
    <section
      id="proposito"
      ref={ref}
      className={`verse${reduce ? ' verse--static' : ''}`}
      aria-labelledby="verse-title"
    >
      <div className="verse__sticky">
        <div className="verse__glow" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <motion.div className="verse__mono" style={{ scale: monoScale, rotate: monoRotate }} aria-hidden="true">
          <Monogram />
        </motion.div>

        <div className="container verse__inner">
          <h2 id="verse-title" className="eyebrow verse__eyebrow">
            Nosso fundamento
          </h2>
          <blockquote className="verse__quote">
            <ScrollLitText
              className="verse__text"
              segments={VERSE.segments}
              progress={scrollYProgress}
              range={[0.06, 0.8]}
            />
            <motion.footer className="verse__ref" style={reduce ? undefined : { opacity: refOpacity, y: refY }}>
              <cite>{VERSE.ref}</cite> · {VERSE.version}
            </motion.footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}
