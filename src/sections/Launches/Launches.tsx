import styled from 'styled-components'
import { ProductCard } from '@/components/product'
import { ArrowRight, Carousel, Container, Section, SectionHeader } from '@/components/ui'
import { useCatalog } from '@/store/catalogContext'

const AllLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border-bottom: 1.5px solid currentColor;

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.4s var(--ease);
  }

  &:hover svg {
    transform: translateX(4px);
  }
`

/** Vitrine “Lançamentos”: carrossel com os seis conjuntos da nova coleção. */
export function Launches() {
  const { sets } = useCatalog()
  return (
    <Section id="lancamentos" $tone="white" aria-labelledby="lancamentos-title">
      <Container>
        <SectionHeader
          id="lancamentos-title"
          eyebrow="Nova coleção"
          title="Lançamentos"
          text="Conjuntos pensados para treinar com liberdade — escolha o tamanho, adicione à sacola e finalize pelo WhatsApp."
          actions={
            <AllLink href="#conjuntos">
              Ver todos os conjuntos <ArrowRight />
            </AllLink>
          }
        />
        <Carousel label="Lançamentos" perView={{ desktop: 4, tablet: 2 }}>
          {sets.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Carousel>
      </Container>
    </Section>
  )
}
