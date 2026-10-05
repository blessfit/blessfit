import { Container, Eyebrow, WhatsApp } from '@/components/ui'
import { PRODUCTS, type Product } from '@/data/site'
import { external, whatsappUrl } from '@/lib/links'
import * as S from './Collection.styles'

export function Collection() {
  return (
    <S.Root id="colecao" $tone="cream" aria-labelledby="collection-title">
      <Container>
        <S.Head>
          <div>
            <Eyebrow>Coleção Essenciais</Eyebrow>
            <S.Title id="collection-title">
              Vista o seu <em>propósito</em>
            </S.Title>
          </div>
          <S.Intro>
            Peças pensadas para acompanhar cada movimento — do treino pesado ao dia a dia. Escolha a sua e fale
            direto com a gente.
          </S.Intro>
        </S.Head>

        <S.Products>
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </S.Products>
      </Container>
    </S.Root>
  )
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const message = `Olá! Tenho interesse no ${product.name} (${product.line}, ${product.color.name}). Pode me passar os detalhes?`

  return (
    <S.Product tag="article" delay={index * 0.12} y={60}>
      <S.Media>
        <S.Img src={product.image.src} alt={product.image.alt} loading="lazy" />
        <S.Img $alt src={product.hover.src} alt="" loading="lazy" />
        <S.Tag>{product.line}</S.Tag>
      </S.Media>

      <S.Body>
        <S.Top>
          <S.Name>{product.name}</S.Name>
          <S.Swatch style={{ background: product.color.hex }} />
        </S.Top>
        <S.Color>{product.color.name}</S.Color>
        <S.Desc>{product.description}</S.Desc>
        <S.Chips aria-label="Destaques">
          {product.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </S.Chips>
        <S.Cta variant="ink" glyph={WhatsApp} href={whatsappUrl(message)} {...external}>
          Quero o meu
        </S.Cta>
      </S.Body>
    </S.Product>
  )
}
