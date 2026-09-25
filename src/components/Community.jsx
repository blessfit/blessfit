import { COMMUNITY, SITE } from '../data/site'
import { external, instagramUrl, whatsappUrl } from '../lib/links'
import { Instagram, WhatsApp } from './Icons'
import { Monogram } from './Logo'
import { Reveal } from './Reveal'
import './Community.css'

export function Community() {
  return (
    <section id="comunidade" className="section section-cream community" aria-labelledby="community-title">
      <div className="container">
        <div className="community__head">
          <div>
            <p className="eyebrow">Comunidade</p>
            <h2 id="community-title" className="h2">
              Faça parte do <em>movimento</em>
            </h2>
          </div>
          <div className="community__side">
            <p className="muted">
              Marque <strong>@{SITE.instagram}</strong> nos seus treinos e use <strong>{SITE.hashtag}</strong>.
              Sua história pode inspirar alguém hoje.
            </p>
            <a className="btn btn--line-ink" href={instagramUrl} {...external}>
              <Instagram className="btn__glyph" />
              Seguir no Instagram
            </a>
          </div>
        </div>

        <ul className="community__grid">
          {COMMUNITY.map((item, i) => (
            <Reveal as="li" key={item.src} className="community__tile" delay={i * 0.06}>
              <a href={instagramUrl} {...external} aria-label={`${item.alt} — ver no Instagram`}>
                <img src={item.src} alt="" loading="lazy" />
                <span className="community__overlay" aria-hidden="true">
                  <Instagram />
                </span>
              </a>
            </Reveal>
          ))}
        </ul>

        <Reveal className="vip">
          <Monogram className="vip__mono" />
          <div>
            <p className="eyebrow">Lista VIP</p>
            <h3 className="h2 vip__title">
              Seja o primeiro a saber dos <em>lançamentos</em>
            </h3>
            <p className="vip__text">
              Entre para a lista VIP e receba novidades e lançamentos em primeira mão, direto no seu WhatsApp.
            </p>
          </div>
          <div className="vip__actions">
            <a
              className="btn btn--cream"
              href={whatsappUrl('Olá! Quero entrar para a Lista VIP da blessfit.')}
              {...external}
            >
              <WhatsApp className="btn__glyph" />
              Quero entrar
            </a>
            <span className="vip__note">Sem spam. Só o que importa.</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
