import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/product'
import { Carousel, Container, Section, SectionHeader, Tab, TabList } from '@/components/ui'
import { PIECES, type Kind } from '@/data/products'

type Filter = 'Todas' | Exclude<Kind, 'Conjunto'>

/** Abas com âncora: as categorias “Blusas” e “Shorts” (#blusas/#shorts) rolam até aqui e abrem a aba certa. */
const TABS: { id: string; filter: Filter; label: string }[] = [
  { id: 'pecas-todas', filter: 'Todas', label: 'Todas' },
  { id: 'blusas', filter: 'Blusa', label: 'Blusas' },
  { id: 'shorts', filter: 'Shorts', label: 'Shorts' },
  { id: 'leggings', filter: 'Legging', label: 'Leggings' },
]

const fromHash = (): Filter | null => TABS.find((t) => `#${t.id}` === window.location.hash)?.filter ?? null

/** “Peças avulsas”: tops, regatas, camisetas, shorts e leggings vendidos separadamente, com troca de cor e fotos. */
export function Pieces() {
  const [filter, setFilter] = useState<Filter>('Todas')

  useEffect(() => {
    const onHash = () => {
      const next = fromHash()
      if (next) setFilter(next)
    }
    onHash() // aba vinda do link (#...): só dá para ler no navegador, depois da primeira renderização
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const items = filter === 'Todas' ? PIECES : PIECES.filter((p) => p.kind === filter)

  return (
    <Section id="pecas" $tone="white" aria-labelledby="pecas-title">
      <Container>
        <SectionHeader
          id="pecas-title"
          eyebrow="Monte do seu jeito"
          title="Peças avulsas"
          text="Prefere combinar? Compre o top, a regata, a camiseta, o shorts ou a legging separadamente, na cor que quiser."
          actions={
            <TabList role="tablist" aria-label="Tipo de peça">
              {TABS.map((tab) => (
                <Tab
                  key={tab.id}
                  id={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.filter}
                  aria-controls="pecas-lista"
                  onClick={() => setFilter(tab.filter)}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabList>
          }
        />
        <div id="pecas-lista" role="tabpanel" aria-label={TABS.find((t) => t.filter === filter)?.label}>
          {/* `key` volta o carrossel ao início ao trocar de aba */}
          <Carousel key={filter} label="Peças avulsas" perView={{ desktop: 4, tablet: 2 }}>
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Carousel>
        </div>
      </Container>
    </Section>
  )
}
