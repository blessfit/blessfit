import { VALUES } from '../data/site'
import { Reveal, SplitReveal } from './Reveal'
import { RotatingBadge } from './RotatingBadge'
import './Manifesto.css'

const TEXT =
  'Acreditamos que o treino vai além do espelho. Cada repetição é gratidão, cada gota de suor é disciplina, cada passo é *propósito.* A blessfit nasceu para vestir quem cuida do corpo como quem cuida de um *templo.*'

export function Manifesto() {
  return (
    <section id="manifesto" className="section section-cream manifesto" aria-labelledby="manifesto-title">
      <div className="container">
        <div className="manifesto__grid">
          <div className="manifesto__aside">
            <h2 id="manifesto-title" className="eyebrow">
              Manifesto
            </h2>
            <Reveal className="manifesto__badge" delay={0.2}>
              <RotatingBadge />
            </Reveal>
          </div>
          <SplitReveal className="manifesto__text" text={TEXT} />
        </div>

        <ol className="values">
          {VALUES.map((value, i) => (
            <Reveal as="li" key={value.title} className="value" delay={i * 0.12}>
              <span className="value__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="value__title">{value.title}</h3>
              <p className="value__text">{value.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
