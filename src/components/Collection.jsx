import { PRODUCTS } from '../data/site'
import { external, whatsappUrl } from '../lib/links'
import { WhatsApp } from './Icons'
import { Reveal } from './Reveal'
import './Collection.css'

export function Collection() {
  return (
    <section id="colecao" className="section section-cream collection" aria-labelledby="collection-title">
      <div className="container">
        <header className="collection__head">
          <div>
            <p className="eyebrow">Coleção Essenciais</p>
            <h2 id="collection-title" className="h2">
              Vista o seu <em>propósito</em>
            </h2>
          </div>
          <p className="collection__intro muted">
            Peças pensadas para acompanhar cada movimento — do treino pesado ao dia a dia. Escolha a sua e fale
            direto com a gente.
          </p>
        </header>

        <div className="products">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, index }) {
  const message = `Olá! Tenho interesse no ${product.name} (${product.line}, ${product.color.name}). Pode me passar os detalhes?`

  return (
    <Reveal as="article" className="product" delay={index * 0.12} y={60}>
      <div className="product__media arch">
        <img className="product__img" src={product.image.src} alt={product.image.alt} loading="lazy" />
        <img className="product__img product__img--alt" src={product.hover.src} alt="" loading="lazy" />
        <span className="product__tag">{product.line}</span>
      </div>

      <div className="product__body">
        <div className="product__top">
          <h3 className="product__name">{product.name}</h3>
          <span className="product__swatch" style={{ background: product.color.hex }} />
        </div>
        <p className="product__color">{product.color.name}</p>
        <p className="product__desc">{product.description}</p>
        <ul className="product__chips" aria-label="Destaques">
          {product.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <a className="btn btn--ink product__cta" href={whatsappUrl(message)} {...external}>
          <WhatsApp className="btn__glyph" />
          Quero o meu
        </a>
      </div>
    </Reveal>
  )
}
