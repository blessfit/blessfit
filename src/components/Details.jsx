import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { DETAILS } from '../data/site'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { ArrowRight } from './Icons'
import './Details.css'

/**
 * Desktop: a seção fica fixa e o scroll vertical move a galeria na horizontal.
 * Mobile / movimento reduzido: carrossel com arraste nativo.
 */
export function Details() {
  const isDesktop = useMediaQuery('(min-width: 900px)')
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
    <section
      id="detalhes"
      ref={sectionRef}
      className={`details${pinned ? ' details--pinned' : ''}`}
      style={pinned && height ? { height } : undefined}
      aria-labelledby="details-title"
    >
      <div ref={stickyRef} className="details__sticky">
        {!pinned && <DetailsIntro />}
        <motion.div ref={trackRef} className="details__track" style={{ x }}>
          {pinned && <DetailsIntro progress={scrollYProgress} />}
          {DETAILS.map((item, i) => (
            <DetailCard key={item.title} item={item} index={i} />
          ))}
          {pinned && <DetailsOutro />}
        </motion.div>
      </div>
    </section>
  )
}

function DetailsIntro({ progress }) {
  return (
    <div className="details__intro">
      <p className="eyebrow">Nos detalhes</p>
      <h2 id="details-title" className="h2">
        Feito para <em>acompanhar</em> você
      </h2>
      <p className="muted details__lead">
        Cada costura, alça e cós foi pensado para dar segurança, conforto e liberdade — do primeiro ao último
        movimento.
      </p>
      {progress && (
        <div className="details__progress" aria-hidden="true">
          <motion.span style={{ scaleX: progress }} />
        </div>
      )}
    </div>
  )
}

function DetailCard({ item, index }) {
  return (
    <article className="detail">
      <div className="detail__media">
        <img src={item.img} alt={item.alt} loading="lazy" />
      </div>
      <div className="detail__caption">
        <span className="detail__num">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3 className="detail__title">{item.title}</h3>
          <p className="detail__text">{item.text}</p>
        </div>
      </div>
    </article>
  )
}

function DetailsOutro() {
  return (
    <div className="details__outro">
      <p className="details__outro-text">Qualidade que você sente já no primeiro treino.</p>
      <a href="#colecao" className="btn btn--line-cream">
        Ver coleção
        <ArrowRight className="btn__icon" />
      </a>
    </div>
  )
}
