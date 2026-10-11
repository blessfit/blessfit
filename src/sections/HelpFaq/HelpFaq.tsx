import styled from 'styled-components'
import { Accordion, Button, Container, Ruler, Section, SectionHeader, WhatsApp } from '@/components/ui'
import { FAQ } from '@/data/content'
import { external, whatsappUrl } from '@/lib/links'
import { useStore } from '@/store/storeContext'
import { media } from '@/styles/media'

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: clamp(24px, 6vw, 96px);
  align-items: start;

  ${media.md} {
    grid-template-columns: 1fr;
  }
`

const Aside = styled.div`
  display: grid;
  gap: 12px;
  justify-items: start;

  ${media.desktop} {
    position: sticky;
    top: 150px;
  }
`

/** Perguntas frequentes + atalhos para o WhatsApp e o guia de tamanhos. */
export function HelpFaq() {
  const { openInfo } = useStore()
  return (
    <Section id="faq" $tone="paper" aria-labelledby="faq-title">
      <Container>
        <Layout>
          <Aside>
            <SectionHeader
              id="faq-title"
              eyebrow="Dúvidas"
              title="Perguntas frequentes"
              text="Não encontrou o que procurava? Nosso time responde rapidinho pelo WhatsApp."
            />
            <Button
              variant="primary"
              glyph={WhatsApp}
              href={whatsappUrl('Olá! Tenho uma dúvida sobre a Blessfit.')}
              {...external}
            >
              Chamar no WhatsApp
            </Button>
            <Button as="button" variant="outline" glyph={Ruler} onClick={() => openInfo('tamanhos')}>
              Guia de tamanhos
            </Button>
          </Aside>
          <Accordion items={FAQ} />
        </Layout>
      </Container>
    </Section>
  )
}
