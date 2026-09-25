import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { HERO, SITE } from '../data/site'
import { EASE, EASE_IO } from '../lib/ease'
import { ArrowRight } from './Icons'
import { RotatingBadge } from './RotatingBadge'
import './Hero.css'

const LINES = ['Movimento', 'também é']

export function Hero({ ready }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])
  const fade = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0, 0])
  const yMain = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const ySecond = useTransform(scrollYProgress, [0, 1], ['0%', '-26%'])

  // entrada em sequência, disparada quando a abertura termina
  const enter = (delay) => ({
    initial: { opacity: 0, y: 26 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.1, ease: EASE, delay },
  })
  const rise = (delay) => ({
    initial: { y: '115%' },
    animate: ready ? { y: '0%' } : undefined,
    transition: { duration: 1.2, ease: EASE, delay },
  })

  return (
    <section id="top" ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <div className="container hero__grid">
        <motion.div className="hero__text" style={{ y: yText, opacity: fade }}>
          <motion.p className="eyebrow hero__eyebrow" {...enter(0.1)}>
            Coleção Essenciais
          </motion.p>

          <h1 id="hero-title" className="hero__title">
            {LINES.map((line, i) => (
              <span className="hero__line" key={line}>
                <motion.span {...rise(0.18 + i * 0.1)}>{line}</motion.span>
              </span>
            ))}
            <span className="hero__line hero__line--accent">
              <motion.span className="hero__accent" {...rise(0.38)}>
                propósito.
                <svg className="hero__swash" viewBox="0 0 320 30" preserveAspectRatio="none" aria-hidden="true">
                  <motion.path
                    d="M4 22C70 10 170 4 316 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={ready ? { pathLength: 1 } : undefined}
                    transition={{ duration: 1.3, ease: EASE, delay: 1.2 }}
                  />
                </svg>
              </motion.span>
            </span>
          </h1>

          <motion.p className="lead hero__lead" {...enter(0.6)}>
            Roupas fitness para quem treina com fé, força e propósito. Conforto, performance e estilo — do
            treino ao dia a dia.
          </motion.p>

          <motion.div className="hero__ctas" {...enter(0.72)}>
            <a href="#colecao" className="btn btn--cream">
              Ver coleção
              <ArrowRight className="btn__icon" />
            </a>
            <a href="#proposito" className="link">
              Nosso propósito
            </a>
          </motion.div>
        </motion.div>

        <div className="hero__visual">
          <motion.figure className="hero__main arch" style={{ y: yMain }}>
            <motion.div
              className="hero__reveal"
              initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={ready ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
              transition={{ duration: 1.5, ease: EASE_IO, delay: 0.2 }}
            >
              <motion.img
                src={HERO.main.src}
                alt={HERO.main.alt}
                fetchPriority="high"
                initial={{ scale: 1.3 }}
                animate={ready ? { scale: 1 } : undefined}
                transition={{ duration: 2, ease: EASE, delay: 0.2 }}
              />
            </motion.div>
          </motion.figure>

          <motion.figure className="hero__second" style={{ y: ySecond }}>
            <motion.div
              className="hero__reveal"
              initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
              animate={ready ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
              transition={{ duration: 1.4, ease: EASE_IO, delay: 0.55 }}
            >
              <img src={HERO.second.src} alt={HERO.second.alt} />
            </motion.div>
          </motion.figure>

          <motion.div
            className="hero__badge"
            initial={{ scale: 0, rotate: -120 }}
            animate={ready ? { scale: 1, rotate: 0 } : undefined}
            transition={{ duration: 1.3, ease: EASE, delay: 0.9 }}
          >
            <RotatingBadge />
          </motion.div>

          <motion.p
            className="hero__note script"
            aria-hidden="true"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1.2, ease: EASE, delay: 1.3 }}
          >
            Seu treino,
            <br />
            com mais liberdade.
          </motion.p>
        </div>
      </div>

      <motion.div className="hero__foot-wrap" style={{ opacity: fade }}>
        <motion.div
          className="container hero__foot"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <span>{SITE.verseRef}</span>
          <a href="#manifesto" className="hero__scroll" aria-label="Rolar para o manifesto">
            <span />
          </a>
          <span>{SITE.tagline}</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
