import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { Fragment, useRef } from 'react'
import { Star } from './Icons'
import './Marquee.css'

const ITEMS = ['Faith', 'Strength', 'Purpose', 'Conforto', 'Performance', 'Estilo']
const BASE_SPEED = -0.9 // % da faixa por segundo

const wrap = (min, max, v) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

/** Faixa infinita que acelera e inverte conforme a velocidade do scroll. */
export function Marquee() {
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, [0, 1000], [0, 4], { clamp: false })
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`)
  const direction = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    let moveBy = direction.current * BASE_SPEED * (delta / 1000)
    if (boost.get() < 0) direction.current = -1
    else if (boost.get() > 0) direction.current = 1
    moveBy += direction.current * moveBy * boost.get()
    baseX.set(baseX.get() + moveBy)
  })

  return (
    <div className="band" aria-hidden="true">
      <div className="marquee">
        <motion.div className="marquee__track" style={{ x }}>
          {[0, 1, 2, 3].map((copy) => (
            <div className="marquee__group" key={copy}>
              {ITEMS.map((item) => (
                <Fragment key={item}>
                  <span className="marquee__item">{item}</span>
                  <Star className="marquee__star" />
                </Fragment>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
