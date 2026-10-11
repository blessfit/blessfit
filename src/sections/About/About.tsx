import styled from 'styled-components'
import { Button, Container, Monogram, Picture, Section, SectionEyebrow, SectionTitle } from '@/components/ui'
import { PURPOSE } from '@/data/content'
import { media } from '@/styles/media'

const Intro = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(28px, 6vw, 96px);
  align-items: end;
  margin-bottom: clamp(40px, 6vw, 72px);

  ${media.md} {
    grid-template-columns: 1fr;
  }
`

const Text = styled.p`
  max-width: 54ch;
  margin-top: 18px;
  color: var(--muted);
  font-size: clamp(1rem, 1.2vw, 1.1rem);
`

const Verse = styled.blockquote`
  position: relative;
  padding-left: 28px;
  border-left: 2px solid var(--mint);

  p {
    font-size: clamp(1.4rem, 2.4vw, 2.1rem);
    font-weight: 300;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  cite {
    display: block;
    margin-top: 14px;
    color: var(--mint);
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  svg {
    width: 56px;
    height: auto;
    margin-bottom: 20px;
    color: var(--mint);
  }
`

const Pillars = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 1.6vw, 24px);

  ${media.md} {
    grid-template-columns: 1fr;
  }
`

const Pillar = styled.li`
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: clamp(380px, 38vw, 520px);
  padding: clamp(22px, 2.4vw, 32px);
  border-radius: var(--radius);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(0deg, rgb(8 42 49 / 0.95) 0%, rgb(8 42 49 / 0.35) 55%, rgb(8 42 49 / 0.1) 100%);
  }

  img {
    position: absolute;
    inset: 0;
    z-index: -2;
  }

  ${media.md} {
    min-height: 340px;
  }
`

const PillarTitle = styled.h3`
  font-size: clamp(2.2rem, 3.6vw, 3.2rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--white);

  small {
    display: block;
    margin-top: 8px;
    color: var(--mint);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
`

const PillarText = styled.p`
  max-width: 36ch;
  margin-top: 14px;
  color: var(--on-ink-muted);
  font-size: 15px;
`

/** Sobre a Blessfit: propósito da marca e os pilares Faith, Strength e Purpose. */
export function About() {
  return (
    <Section id="proposito" $tone="petrol" aria-labelledby="proposito-title">
      <Container>
        <Intro>
          <div>
            <SectionEyebrow>{PURPOSE.eyebrow}</SectionEyebrow>
            <SectionTitle id="proposito-title">{PURPOSE.title}</SectionTitle>
            <Text>{PURPOSE.text}</Text>
            <div style={{ marginTop: 28 }}>
              <Button variant="light" href="#lancamentos">
                Vista o propósito
              </Button>
            </div>
          </div>
          <Verse>
            <Monogram />
            <p>{PURPOSE.verse}</p>
            <cite>{PURPOSE.verseRef}</cite>
          </Verse>
        </Intro>

        <Pillars>
          {PURPOSE.pillars.map((pillar) => (
            <Pillar key={pillar.en}>
              <Picture image={pillar.image} decorative sizes="(max-width: 1023px) 100vw, 33vw" />
              <PillarTitle>
                {pillar.en}
                <small>{pillar.pt}</small>
              </PillarTitle>
              <PillarText>{pillar.text}</PillarText>
            </Pillar>
          ))}
        </Pillars>
      </Container>
    </Section>
  )
}
