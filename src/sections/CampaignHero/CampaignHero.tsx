import { ArrowRight, Button, Picture } from '@/components/ui'
import { IMAGES } from '@/data/images'
import { HERO, SHOP } from '@/data/shop'
import * as S from './CampaignHero.styles'

/** Banner da campanha: foto grande, título forte e duas chamadas. */
export function CampaignHero() {
  return (
    <S.Root aria-labelledby="hero-title">
      <S.Banner>
        <S.Media>
          <Picture image={IMAGES.hero} priority sizes="100vw" />
        </S.Media>

        <S.Content>
          <S.Eyebrow>{HERO.eyebrow}</S.Eyebrow>
          <S.Title id="hero-title">{HERO.title}</S.Title>
          <S.Text>{HERO.text}</S.Text>
          <S.Actions>
            <Button variant="light" icon={ArrowRight} href={HERO.primary.href}>
              {HERO.primary.label}
            </Button>
            <Button variant="outlineLight" href={HERO.secondary.href}>
              {HERO.secondary.label}
            </Button>
          </S.Actions>
        </S.Content>

        <S.Tagline aria-hidden="true">
          {SHOP.tagline}
          <span>{SHOP.verseRef}</span>
        </S.Tagline>
      </S.Banner>
    </S.Root>
  )
}
