import styled from 'styled-components'
import { Button, Container, Instagram, Picture, Section, SectionHeader } from '@/components/ui'
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
  scroll-snap-align: start;

  > a {
    display: flex;
    flex: 1;
    flex-direction: column;
    border-radius: var(--radius);
    background: var(--paper);
    overflow: hidden;
    transition: transform 0.4s var(--ease);
  }

  > a:hover {
    transform: translateY(-4px);
  }

  > a:hover img {
    transform: scale(1.04);
  }

  > a:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
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

  blockquote {
    flex: 1;
    font-size: 15px;
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

const Bought = styled.span`
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--mint-soft);
  color: var(--petrol-deep);
  font-size: 11px;
  font-weight: 700;
`

const SeePost = styled.span`
  padding-top: 12px;
  border-top: 1px solid var(--line);
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

/** Avaliações que as clientes mandaram no Instagram e galeria da comunidade. */
export function Reviews() {
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
            <Card key={review.handle}>
              <a
                href={review.url ?? instagramUrl}
                {...external}
                aria-label={`Avaliação de ${review.name} (@${review.handle}) — ver no Instagram`}
              >
                <Photo>
                  <Picture image={review.photo} sizes="(max-width: 639px) 86vw, (max-width: 1023px) 50vw, 25vw" />
                  <span>
                    <Instagram />
                  </span>
                </Photo>
                <Body>
                  <Author>
                    <span aria-hidden="true">{review.name.charAt(0)}</span>
                    <div>
                      <strong>{review.name}</strong>@{review.handle}
                    </div>
                  </Author>
                  <blockquote>“{review.text}”</blockquote>
                  <Bought>Comprou: {review.product}</Bought>
                  <SeePost aria-hidden="true">Ver no Instagram →</SeePost>
                </Body>
              </a>
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
