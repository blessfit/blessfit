import styled from 'styled-components'
import { Reveal, Section, SplitReveal } from '@/components/ui'
import { media } from '@/styles/media'

export const Root = styled(Section)`
  padding-top: calc(var(--section-y) + 32px);
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 0.28fr) minmax(0, 1fr);
  gap: clamp(32px, 6vw, 100px);

  ${media.md} {
    grid-template-columns: 1fr;
  }
`

export const Aside = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  padding-top: 0.6em;

  ${media.md} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-top: 0;
  }
`

export const Badge = styled(Reveal)`
  width: clamp(120px, 11vw, 168px);

  ${media.md} {
    width: 104px;
  }
`

export const Text = styled(SplitReveal)`
  font-size: clamp(1.75rem, 3.4vw, 3.4rem);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.028em;
  text-wrap: pretty;
`

export const Values = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(24px, 4vw, 64px);
  margin-top: clamp(72px, 9vw, 136px);
  padding-top: 36px;
  border-top: 1px solid var(--line-cream);

  ${media.md} {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`

export const ValueNum = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--petrol);
`

export const ValueTitle = styled.h3`
  margin: 16px 0 10px;
  font-size: clamp(1.45rem, 2.1vw, 1.9rem);
  font-weight: 300;
  letter-spacing: -0.02em;
`

export const ValueText = styled.p`
  max-width: 32ch;
  font-size: 15px;
  color: var(--on-cream-muted);
`
