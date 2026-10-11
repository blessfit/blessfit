import styled from 'styled-components'
import { Button, Container, Instagram, Picture, Section, SectionHeader, Stars } from '@/components/ui'
import { COMMUNITY, REVIEWS } from '@/data/content'
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

const Card = styled.li`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: clamp(22px, 2.4vw, 28px);
  border-radius: var(--radius);
  background: var(--paper);
  scroll-snap-align: start;

  blockquote {
    flex: 1;
    font-size: 15px;
    line-height: 1.6;
  }

  footer {
    display: flex;
    flex-direction: column;
    padding-top: 14px;
    border-top: 1px solid var(--line);
    font-size: 13px;
    color: var(--text-muted);
  }

  strong {
    color: var(--ink);
    font-size: 14px;
  }
`

const Bought = styled.span`
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--mint-soft);
  color: var(--petrol-deep);
  font-size: 11px;
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

const average = REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length

/** Avaliações de clientes e galeria da comunidade no Instagram. */
export function Reviews() {
  return (
    <Section id="comunidade" $tone="white" aria-labelledby="comunidade-title">
      <Container>
        <SectionHeader
          id="comunidade-title"
          eyebrow="Avaliações"
          title="Quem treina com a gente"
          actions={
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
              <Stars rating={Math.round(average)} />
              {average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} de 5
            </span>
          }
        />
        <Cards>
          {REVIEWS.map((review) => (
            <Card key={review.name}>
              <Stars rating={review.rating} />
              <blockquote>“{review.text}”</blockquote>
              <Bought>Comprou: {review.product}</Bought>
              <footer>
                <strong>{review.name}</strong>
                {review.city}
              </footer>
            </Card>
          ))}
        </Cards>

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
