import { useState } from 'react'
import { FAQ } from '../data/site'
import { external, whatsappUrl } from '../lib/links'
import { ArrowUpRight, Plus } from './Icons'
import './Faq.css'

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="section section-cream faq" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <div className="faq__intro">
          <p className="eyebrow">Dúvidas</p>
          <h2 id="faq-title" className="h2">
            Perguntas <em>frequentes</em>
          </h2>
          <p className="muted">Não encontrou o que procurava? Fale com a gente pelo WhatsApp.</p>
          <a className="link" href={whatsappUrl('Olá! Tenho uma dúvida sobre a blessfit.')} {...external}>
            Chamar no WhatsApp
            <ArrowUpRight />
          </a>
        </div>

        <ul className="faq__list">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <li key={item.q} className={`faq__item${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    className="faq__q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <span className="faq__icon" aria-hidden="true">
                      <Plus />
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} className="faq__a" role="region" aria-labelledby={`faq-q-${i}`} inert={!isOpen}>
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
