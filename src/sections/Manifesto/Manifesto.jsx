import { Container, Eyebrow, Reveal, RotatingBadge } from '@/components/ui'
import { VALUES } from '@/data/site'
import * as S from './Manifesto.styles'

const TEXT =
  'Acreditamos que o treino vai além do espelho. Cada repetição é gratidão, cada gota de suor é disciplina, cada passo é *propósito.* A blessfit nasceu para vestir quem cuida do corpo como quem cuida de um *templo.*'

export function Manifesto() {
  return (
    <S.Root id="manifesto" $tone="cream" aria-labelledby="manifesto-title">
      <Container>
        <S.Grid>
          <S.Aside>
            <Eyebrow as="h2" id="manifesto-title">
              Manifesto
            </Eyebrow>
            <S.Badge delay={0.2}>
              <RotatingBadge />
            </S.Badge>
          </S.Aside>
          <S.Text text={TEXT} />
        </S.Grid>

        <S.Values>
          {VALUES.map((value, i) => (
            <Reveal tag="li" key={value.title} delay={i * 0.12}>
              <S.ValueNum>{String(i + 1).padStart(2, '0')}</S.ValueNum>
              <S.ValueTitle>{value.title}</S.ValueTitle>
              <S.ValueText>{value.text}</S.ValueText>
            </Reveal>
          ))}
        </S.Values>
      </Container>
    </S.Root>
  )
}
