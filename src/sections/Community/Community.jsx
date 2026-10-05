import { Button, Container, Eyebrow, Instagram, Muted, Reveal, Section, WhatsApp } from '@/components/ui'
import { COMMUNITY, SITE } from '@/data/site'
import { external, instagramUrl, whatsappUrl } from '@/lib/links'
import * as S from './Community.styles'

export function Community() {
  return (
    <Section id="comunidade" $tone="cream" aria-labelledby="community-title">
      <Container>
        <S.Head>
          <div>
            <Eyebrow>Comunidade</Eyebrow>
            <S.Title id="community-title">
              Faça parte do <em>movimento</em>
            </S.Title>
          </div>
          <S.Side>
            <Muted>
              Marque <strong>@{SITE.instagram}</strong> nos seus treinos e use <strong>{SITE.hashtag}</strong>.
              Sua história pode inspirar alguém hoje.
            </Muted>
            <Button variant="lineInk" glyph={Instagram} href={instagramUrl} {...external}>
              Seguir no Instagram
            </Button>
          </S.Side>
        </S.Head>

        <S.Grid>
          {COMMUNITY.map((item, i) => (
            <Reveal tag="li" key={item.src} delay={i * 0.06}>
              <S.TileLink href={instagramUrl} {...external} aria-label={`${item.alt} — ver no Instagram`}>
                <img src={item.src} alt="" loading="lazy" />
                <S.Overlay aria-hidden="true">
                  <Instagram />
                </S.Overlay>
              </S.TileLink>
            </Reveal>
          ))}
        </S.Grid>

        <S.Vip>
          <S.VipMono />
          <div>
            <Eyebrow>Lista VIP</Eyebrow>
            <S.VipTitle as="h3">
              Seja o primeiro a saber dos <em>lançamentos</em>
            </S.VipTitle>
            <S.VipText>
              Entre para a lista VIP e receba novidades e lançamentos em primeira mão, direto no seu WhatsApp.
            </S.VipText>
          </div>
          <S.VipActions>
            <Button
              variant="cream"
              glyph={WhatsApp}
              href={whatsappUrl('Olá! Quero entrar para a Lista VIP da blessfit.')}
              {...external}
            >
              Quero entrar
            </Button>
            <S.VipNote>Sem spam. Só o que importa.</S.VipNote>
          </S.VipActions>
        </S.Vip>
      </Container>
    </Section>
  )
}
