import styled from 'styled-components'
import { ArrowUpRight, Container, Picture, Section, SectionHeader } from '@/components/ui'
import { CATEGORIES } from '@/data/content'
import { external, whatsappUrl } from '@/lib/links'
import { snapScroller } from '@/styles/mixins'
import { media } from '@/styles/media'

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(10px, 1.4vw, 20px);

  ${media.md} {
    ${snapScroller}
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: 34%;
    scroll-padding-inline: 0;
  }

  ${media.sm} {
    grid-auto-columns: 62%;
  }
`

const Tile = styled.a`
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  aspect-ratio: 3 / 4;
  padding: 18px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  color: var(--white);
  scroll-snap-align: start;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(0deg, rgb(20 25 12 / 0.72) 0%, rgb(20 25 12 / 0) 55%);
  }

  img {
    position: absolute;
    inset: 0;
    z-index: -2;
    transition: transform 1s var(--ease);
  }

  &:hover img {
    transform: scale(1.05);
  }
`

const Label = styled.span`
  display: flex;
  flex: 1;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;

  strong {
    display: block;
    font-size: clamp(1.1rem, 1.5vw, 1.4rem);
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  small {
    color: rgb(255 255 255 / 0.8);
    font-size: 12px;
  }
`

const Arrow = styled.span`
  display: grid;
  place-items: center;
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--white);
  color: var(--ink);
  transition: transform 0.4s var(--ease);

  svg {
    width: 18px;
    height: 18px;
  }

  ${Tile}:hover & {
    transform: rotate(45deg);
  }
`

/**
 * “Compre por categoria”: atalhos com foto para as linhas da loja.
 * Quando <Launches /> (também branca) voltar logo acima, use `style={{ paddingTop: 0 }}`
 * para as duas seções não somarem o espaçamento.
 */
export function Categories() {
  return (
    <Section id="categorias" $tone="white" aria-labelledby="categorias-title">
      <Container>
        <SectionHeader id="categorias-title" eyebrow="Coleções" title="Compre por categoria" />
        <Grid>
          {CATEGORIES.map((category) => (
            <li key={category.label} style={{ display: 'contents' }}>
              <Tile
                href={category.whatsapp ? whatsappUrl(category.whatsapp) : category.href}
                {...(category.whatsapp ? external : {})}
              >
                <Picture image={category.image} decorative sizes="(max-width: 639px) 62vw, (max-width: 1023px) 34vw, 20vw" />
                <Label>
                  <span>
                    <strong>{category.label}</strong>
                    <small>{category.caption}</small>
                  </span>
                  <Arrow aria-hidden="true">
                    <ArrowUpRight />
                  </Arrow>
                </Label>
              </Tile>
            </li>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
