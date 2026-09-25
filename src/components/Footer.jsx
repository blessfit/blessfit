import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { NAV, SITE } from '../data/site'
import { external, instagramUrl, whatsappUrl } from '../lib/links'
import { WhatsApp } from './Icons'
import { Monogram, Wordmark } from './Logo'
import './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="grain" aria-hidden="true" />
      <div className="container">
        <div className="footer__cta">
          <p className="footer__script script">
            Seu treino,
            <br />
            com mais liberdade.
          </p>
          <a className="btn btn--cream" href={whatsappUrl()} {...external}>
            <WhatsApp className="btn__glyph" />
            Comprar pelo WhatsApp
          </a>
        </div>

        <div className="footer__cols">
          <div className="footer__brand">
            <span className="footer__badge">
              <Monogram />
            </span>
            <p className="muted">
              Moda fitness com propósito. Conforto, performance e estilo para quem treina com fé, força e
              propósito.
            </p>
          </div>

          <nav className="footer__col" aria-label="Rodapé">
            <h2 className="footer__heading">Navegue</h2>
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="footer__col">
            <h2 className="footer__heading">Fale com a gente</h2>
            <a href={whatsappUrl()} {...external}>
              WhatsApp
            </a>
            <a href={instagramUrl} {...external}>
              Instagram @{SITE.instagram}
            </a>
          </div>
        </div>

        <FooterMark />

        <div className="footer__bottom">
          <span>© {year} blessfit. Todos os direitos reservados.</span>
          <span>
            {SITE.tagline} — {SITE.verseRef}
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterMark() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['55%', '0%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [0, 1, 1])

  return (
    <div ref={ref} className="footer__mark" aria-hidden="true">
      <motion.div style={{ y, opacity }}>
        <Wordmark />
      </motion.div>
    </div>
  )
}
