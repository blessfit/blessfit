import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { SetCard } from '@/components/product'
import { Container, Section, SectionHeader, Tab, TabList } from '@/components/ui'
import { SETS, type Gender } from '@/data/products'
import { snapScroller } from '@/styles/mixins'
import { media } from '@/styles/media'

/** Abas com âncora: o menu “Feminino”/“Masculino” (#feminino/#masculino) rola até aqui e abre a aba certa. */
const TABS: { id: string; gender: Gender }[] = [
  { id: 'feminino', gender: 'Feminino' },
  { id: 'masculino', gender: 'Masculino' },
]

const fromHash = (): Gender | null => TABS.find((t) => `#${t.id}` === window.location.hash)?.gender ?? null

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 1.6vw, 24px);

  ${media.md} {
    grid-template-columns: 1fr;
  }

  /* celular: carrossel com um conjunto por vez */
  ${media.sm} {
    ${snapScroller}
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: 88%;
    scroll-padding-inline: 0;

    > * {
      scroll-snap-align: start;
    }
  }
`

/** “Escolha seu conjunto”: os três conjuntos de cada linha, com peças, tamanhos e compra. */
export function ChooseSet() {
  const [gender, setGender] = useState<Gender>('Feminino')

  useEffect(() => {
    const onHash = () => {
      const next = fromHash()
      if (next) setGender(next)
    }
    onHash() // aba vinda do link (#...): só dá para ler no navegador, depois da primeira renderização
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const sets = SETS.filter((p) => p.gender === gender)

  return (
    <Section id="conjuntos" $tone="paper" aria-labelledby="conjuntos-title">
      <Container>
        <SectionHeader
          id="conjuntos-title"
          eyebrow="Blusa + shorts"
          title="Escolha seu conjunto"
          text="Três combinações femininas e três masculinas, prontas para o treino. Veja as peças de cada conjunto e escolha o seu tamanho."
          actions={
            <TabList role="tablist" aria-label="Linha">
              {TABS.map((tab) => (
                <Tab
                  key={tab.id}
                  id={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={gender === tab.gender}
                  aria-controls="conjuntos-lista"
                  onClick={() => setGender(tab.gender)}
                >
                  {tab.gender}
                </Tab>
              ))}
            </TabList>
          }
        />
        <Grid id="conjuntos-lista" role="tabpanel" aria-label={`Conjuntos ${gender.toLowerCase()}s`}>
          {sets.map((product) => (
            <SetCard key={product.id} product={product} />
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
