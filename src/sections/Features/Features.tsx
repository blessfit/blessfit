import { useInView } from 'motion/react'
import { useRef, type CSSProperties } from 'react'
import {
  DiamondIcon,
  DropIcon,
  DumbbellIcon,
  Eyebrow,
  FeatherIcon,
  type IconComponent,
  Section,
  StretchIcon,
  WavesIcon,
} from '@/components/ui'
import { FEATURES, FEATURES_IMAGE, type Feature as FeatureItem, type FeatureIcon } from '@/data/site'
import * as S from './Features.styles'

const ICONS: Record<FeatureIcon, IconComponent> = {
  feather: FeatherIcon,
  drop: DropIcon,
  stretch: StretchIcon,
  waves: WavesIcon,
  diamond: DiamondIcon,
  dumbbell: DumbbellIcon,
}

export function Features() {
  return (
    <Section id="tecnologia" $tone="cream" aria-labelledby="features-title">
      <S.Grid>
        <S.Visual>
          <S.Frame y={60}>
            <img src={FEATURES_IMAGE.src} alt={FEATURES_IMAGE.alt} loading="lazy" />
          </S.Frame>
          <S.Chip delay={0.3}>
            <S.Dot />
            Tecido de alta qualidade
          </S.Chip>
        </S.Visual>

        <div>
          <Eyebrow>Tecnologia</Eyebrow>
          <S.Title id="features-title">
            Conforto que você <em>sente</em>
          </S.Title>
          <S.Lead>
            Cada peça une tecido leve, toque macio e elasticidade para acompanhar o seu ritmo — sem apertar, sem
            limitar, sem distrair.
          </S.Lead>
          <S.List>
            {FEATURES.map((feature, i) => (
              <Feature key={feature.title} item={feature} index={i} />
            ))}
          </S.List>
        </div>
      </S.Grid>
    </Section>
  )
}

function Feature({ item, index }: { item: FeatureItem; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const Icon = ICONS[item.icon]
  const delay = (index % 2) * 0.1 + Math.floor(index / 2) * 0.08

  return (
    <S.Feature ref={ref} $inView={inView} style={{ '--d': `${delay}s` } as CSSProperties}>
      <S.FeatureIcon>
        <Icon />
      </S.FeatureIcon>
      <S.FeatureTitle>{item.title}</S.FeatureTitle>
      <S.FeatureText>{item.text}</S.FeatureText>
    </S.Feature>
  )
}
