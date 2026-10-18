import { useState } from 'react'
import styled from 'styled-components'
import { Bag, Button, Container, Dialog, Instagram, Picture, Section, SectionHeader, Stars } from '@/components/ui'
import { COMMUNITY, REVIEWS, type Review } from '@/data/content'
import { findVariant } from '@/data/products'
import { useCatalog } from '@/store/catalogContext'
import { useStore } from '@/store/storeContext'
import { SHOP } from '@/data/shop'
import { external, instagramUrl } from '@/lib/links'
import { snapScroller } from '@/styles/mixins'
import { media } from '@/styles/media'

const Cards = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(14px, 1.6vw, 24px);

  ${media.md} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${media.sm} {
    ${snapScroller}
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: 86%;
    scroll-padding-inline: 0;
  }
`

/** O card: a parte de cima abre o zoom; o selo “Comprou” embaixo põe as peças na sacola. */
const Card = styled.li`
  display: flex;
  flex-direction: column;
  border-radius: var(--radius);
  background: var(--paper);
  overflow: hidden;
  scroll-snap-align: start;

  > button {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  > button:hover img {
    transform: scale(1.04);
  }

  > button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
`

/** Foto da cliente, com o selo do Instagram no canto. */
const Photo = styled.div`
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--surface);

  img {
    transition: transform 0.8s var(--ease);
  }

  > span {
    position: absolute;
    top: 12px;
    right: 12px;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.9);
    color: var(--ink);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  padding: clamp(16px, 1.8vw, 22px);

  /* no card a mensagem é resumida; a janela de zoom mostra inteira */
  blockquote {
    flex: 1;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
    font-size: 15px;
    line-height: 1.6;
  }
`

/** Janela de zoom: o print inteiro ao lado da mensagem completa. */
const Zoom = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);

  ${media.sm} {
    grid-template-columns: none;
  }

  > img {
    width: 100%;
    height: auto;
    max-height: min(calc(100dvh - 120px), 780px);
    object-fit: contain;
    background: var(--white);
    border-right: 1px solid var(--line);
  }

  > div {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: clamp(20px, 3vw, 32px);
  }

  /* no celular o texto fica embaixo da foto: a divisão vira uma linha embaixo dela */
  ${media.sm} {
    > img {
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }
  }

  blockquote {
    font-size: 17px;
    line-height: 1.6;
  }
`

/** Cabeçalho no estilo de um post: inicial, nome e @. */
const Author = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  line-height: 1.3;
  color: var(--text-muted);

  > span {
    display: grid;
    place-items: center;
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--petrol-deep);
    color: var(--cream);
    font-weight: 800;
  }

  strong {
    display: block;
    color: var(--ink);
    font-size: 14px;
  }
`

/** Selo “Comprou: …” — clicar põe as mesmas peças na sacola (o tamanho é escolhido lá). */
const Bought = styled.button`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 6px;
  padding: 6px 12px;
  border: 0;
  border-radius: 999px;
  background: var(--mint-soft);
  color: var(--petrol-deep);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;

  &:hover {
    background: var(--petrol-deep);
    color: var(--cream);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  svg {
    flex: none;
    width: 15px;
    height: 15px;
  }
`

/** Rodapé do card, fora do botão de zoom: o selo de compra. */
const Foot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 clamp(16px, 1.8vw, 22px) clamp(16px, 1.8vw, 22px);

  small {
    color: var(--text-muted);
    font-size: 11px;
  }
`

const SeePost = styled.span`
  font-size: 13px;
  font-weight: 700;
`

const Community = styled.div`
  margin-top: clamp(56px, 7vw, 96px);
`

const CommunityHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  h3 {
    font-size: clamp(1.4rem, 2.2vw, 1.9rem);
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  p {
    color: var(--text-muted);
  }
`

const Gallery = styled.ul`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;

  ${media.md} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  a {
    display: block;
    aspect-ratio: 1;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: var(--surface);
  }

  img {
    transition: transform 0.8s var(--ease);
  }

  a:hover img {
    transform: scale(1.06);
  }
`

/** Inicial, nome e @, como no cabeçalho de um post. */
function ReviewAuthor({ review }: { review: Review }) {
  return (
    <Author>
      <span aria-hidden="true">{review.name.charAt(0)}</span>
      <div>
        <strong>{review.name}</strong>
        {review.handle && `@${review.handle}`}
      </div>
    </Author>
  )
}

/** Selo “Comprou: …”: põe na sacola as peças que a cliente comprou, sem tamanho (a pessoa escolhe lá). */
function BuyLook({ review, onAdd }: { review: Review; onAdd?: () => void }) {
  const { findProduct } = useCatalog()
  const { addToBag } = useStore()
  // peça desativada no painel some do selo
  const pieces = review.items.flatMap(({ id, color }) => {
    const product = findProduct(id)
    return product ? [{ product, variant: findVariant(product, color) }] : []
  })
  if (pieces.length === 0) return null
  const names = pieces.map((p) => p.product.name)

  return (
    <>
      <Bought
        type="button"
        aria-label={`Adicionar à sacola: ${names.join(' e ')}`}
        onClick={() => {
          onAdd?.()
          for (const { product, variant } of pieces) addToBag(product, variant)
        }}
      >
        Comprou: {names.join(' + ')}
        <Bag />
      </Bought>
      <small>Toque para levar o look — o tamanho você escolhe na sacola.</small>
    </>
  )
}

/** Avaliações que as clientes mandaram no Instagram e galeria da comunidade. */
export function Reviews() {
  const [zoomed, setZoomed] = useState<Review | null>(null)

  return (
    <Section id="comunidade" $tone="white" aria-labelledby="comunidade-title">
      <Container>
        <SectionHeader
          id="comunidade-title"
          eyebrow="Avaliações"
          title="Quem treina com a gente"
          text="Mensagens e fotos que as clientes mandaram pra gente no Instagram."
        />
        <Cards>
          {REVIEWS.map((review) => (
            <Card key={review.photo.src}>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`Ver a avaliação de ${review.name} completa`}
                onClick={() => setZoomed(review)}
              >
                <Photo>
                  <Picture image={review.photo} sizes="(max-width: 639px) 86vw, (max-width: 1023px) 50vw, 25vw" />
                  <span>
                    <Instagram />
                  </span>
                </Photo>
                <Body>
                  <ReviewAuthor review={review} />
                  <Stars rating={review.rating} />
                  <blockquote>“{review.text}”</blockquote>
                  <SeePost aria-hidden="true">Ver avaliação completa →</SeePost>
                </Body>
              </button>
              <Foot>
                <BuyLook review={review} />
              </Foot>
            </Card>
          ))}
        </Cards>

        <Dialog open={zoomed !== null} onClose={() => setZoomed(null)} title="Avaliação" width={900}>
          {zoomed && (
            <Zoom>
              <Picture image={zoomed.photo} sizes="(max-width: 639px) 100vw, 480px" eager />
              <div>
                <ReviewAuthor review={zoomed} />
                <Stars rating={zoomed.rating} />
                <blockquote>“{zoomed.text}”</blockquote>
                <Foot style={{ padding: 0 }}>
                  <BuyLook review={zoomed} onAdd={() => setZoomed(null)} />
                </Foot>
                <Button variant="outline" size="sm" glyph={Instagram} href={zoomed.url ?? instagramUrl} {...external}>
                  Ver no Instagram
                </Button>
              </div>
            </Zoom>
          )}
        </Dialog>

        <Community>
          <CommunityHead>
            <div>
              <h3>{COMMUNITY.title}</h3>
              <p>{COMMUNITY.text}</p>
            </div>
            <Button variant="outline" size="sm" glyph={Instagram} href={instagramUrl} {...external}>
              Seguir @{SHOP.instagram}
            </Button>
          </CommunityHead>
          <Gallery>
            {COMMUNITY.images.map((image) => (
              <li key={image.src}>
                <a href={instagramUrl} {...external} aria-label={`${image.alt} — ver no Instagram`}>
                  <Picture image={image} decorative sizes="(max-width: 1023px) 33vw, 16vw" />
                </a>
              </li>
            ))}
          </Gallery>
        </Community>
      </Container>
    </Section>
  )
}
