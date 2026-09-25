import { useState } from 'react'
import { PILLARS } from '../data/site'
import { Reveal } from './Reveal'
import './Pillars.css'

export function Pillars() {
  const [active, setActive] = useState(0)

  return (
    <section id="pilares" className="section pillars" aria-labelledby="pillars-title">
      <div className="container">
        <div className="pillars__head">
          <div>
            <p className="eyebrow">Nossos pilares</p>
            <h2 id="pillars-title" className="h2">
              Faith&nbsp;· Strength&nbsp;· <em>Purpose</em>
            </h2>
          </div>
          <p className="muted pillars__intro">Três palavras que guiam cada peça, cada costura e cada treino.</p>
        </div>

        <div className="pillars__row">
          {PILLARS.map((pillar, i) => (
            <Reveal
              key={pillar.en}
              as="article"
              delay={i * 0.12}
              className={`pillar${active === i ? ' is-active' : ''}`}
              tabIndex={0}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <img className="pillar__img" src={pillar.img} alt="" loading="lazy" />
              <div className="pillar__content">
                <span className="pillar__num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="pillar__title">{pillar.en}</h3>
                <p className="pillar__pt">{pillar.pt}</p>
                <div className="pillar__text">
                  <div>
                    <p>{pillar.text}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
