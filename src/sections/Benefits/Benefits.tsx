import styled from 'styled-components'
import {
  Container,
  DropIcon,
  DumbbellIcon,
  Picture,
  Section,
  SectionHeader,
  StretchIcon,
  WavesIcon,
  type IconComponent,
} from '@/components/ui'
import { BENEFITS, type BenefitIcon } from '@/data/content'
import { IMAGES } from '@/data/images'
import { media } from '@/styles/media'

const ICONS: Record<BenefitIcon, IconComponent> = {
  waves: WavesIcon,
  stretch: StretchIcon,
  drop: DropIcon,
  dumbbell: DumbbellIcon,
}

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: clamp(32px, 6vw, 96px);

  ${media.md} {
    grid-template-columns: 1fr;
  }
`

const Media = styled.figure`
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);

  ${media.md} {
    aspect-ratio: 16 / 10;
  }

  figcaption {
    position: absolute;
    left: 16px;
    bottom: 16px;
    padding: 10px 16px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.92);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }
`

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(16px, 2vw, 24px);

  ${media.xs} {
    grid-template-columns: 1fr;
  }
`

const Item = styled.li`
  padding: clamp(20px, 2.4vw, 28px);
  border: 1px solid var(--line);
  border-radius: var(--radius);

  h3 {
    margin: 18px 0 6px;
    font-size: 1.1rem;
    font-weight: 750;
    letter-spacing: -0.02em;
  }

  p {
    color: var(--text-muted);
    font-size: 14px;
  }
`

const IconWrap = styled.span`
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--mint-soft);
  color: var(--petrol-deep);

  svg {
    width: 26px;
    height: 26px;
  }
`

/** Benefícios do tecido e da modelagem. */
export function Benefits() {
  return (
    <Section $tone="white" aria-labelledby="beneficios-title">
      <Container>
        <Layout>
          <Media>
            <Picture image={IMAGES.benefits} sizes="(max-width: 1023px) 100vw, 45vw" />
            <figcaption>Tecido Blessfit · toque macio</figcaption>
          </Media>
          <div>
            <SectionHeader
              id="beneficios-title"
              eyebrow="Performance e conforto"
              title="Feito para acompanhar cada movimento."
            />
            <List>
              {BENEFITS.map((benefit) => {
                const Icon = ICONS[benefit.icon]
                return (
                  <Item key={benefit.title}>
                    <IconWrap>
                      <Icon />
                    </IconWrap>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.text}</p>
                  </Item>
                )
              })}
            </List>
          </div>
        </Layout>
      </Container>
    </Section>
  )
}
