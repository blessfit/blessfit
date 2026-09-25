import { useInView } from 'motion/react'
import { useRef } from 'react'
import { FEATURES, FEATURES_IMAGE } from '../data/site'
import { DiamondIcon, DropIcon, DumbbellIcon, FeatherIcon, StretchIcon, WavesIcon } from './Icons'
import { Reveal } from './Reveal'
import './Features.css'

const ICONS = {
  feather: FeatherIcon,
  drop: DropIcon,
  stretch: StretchIcon,
  waves: WavesIcon,
  diamond: DiamondIcon,
  dumbbell: DumbbellIcon,
}

export function Features() {
  return (
    <section id="tecnologia" className="section section-cream features" aria-labelledby="features-title">
      <div className="container features__grid">
        <div className="features__visual">
          <Reveal className="features__frame arch" y={60}>
            <img src={FEATURES_IMAGE.src} alt={FEATURES_IMAGE.alt} loading="lazy" />
          </Reveal>
          <Reveal className="features__chip" delay={0.3}>
            <span className="features__dot" />
            Tecido de alta qualidade
          </Reveal>
        </div>

        <div>
          <p className="eyebrow">Tecnologia</p>
          <h2 id="features-title" className="h2">
            Conforto que você <em>sente</em>
          </h2>
          <p className="lead muted features__lead">
            Cada peça une tecido leve, toque macio e elasticidade para acompanhar o seu ritmo — sem apertar, sem
            limitar, sem distrair.
          </p>
          <ul className="features__list">
            {FEATURES.map((feature, i) => (
              <Feature key={feature.title} item={feature} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Feature({ item, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const Icon = ICONS[item.icon]
  const delay = (index % 2) * 0.1 + Math.floor(index / 2) * 0.08

  return (
    <li ref={ref} className={`feature${inView ? ' is-in' : ''}`} style={{ '--d': `${delay}s` }}>
      <span className="feature__icon">
        <Icon />
      </span>
      <h3 className="feature__title">{item.title}</h3>
      <p className="feature__text">{item.text}</p>
    </li>
  )
}
