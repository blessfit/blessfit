import { useState } from 'react'
import styled from 'styled-components'
import {
  Bag,
  Button,
  Dialog,
  Heart,
  HeartFilled,
  Picture,
  PriceTag,
  Repeat,
  Ruler,
  SizePicker,
  Swatches,
  Truck,
  WhatsApp,
} from '@/components/ui'
import type { Product, Variant } from '@/data/products'
import { SHOP } from '@/data/shop'
import { external } from '@/lib/links'
import { useStore } from '@/store/storeContext'
import { media } from '@/styles/media'
import { usePurchase } from '../usePurchase'

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);

  ${media.sm} {
    grid-template-columns: 1fr;
  }
`

const Gallery = styled.div`
  display: grid;
  gap: 10px;
  padding: 16px;
  background: var(--paper);
`

const Main = styled.div`
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--surface);
`

const Thumbs = styled.div`
  display: flex;
  gap: 10px;
  padding: 3px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const Thumb = styled.button<{ $active: boolean }>`
  flex: none;
  width: 72px;
  aspect-ratio: 4 / 5;
  border-radius: 8px;
  overflow: hidden;
  outline: 2px solid ${({ $active }) => ($active ? 'var(--ink)' : 'transparent')};
  outline-offset: 2px;
`

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: clamp(20px, 3vw, 36px);
`

const Meta = styled.p`
  color: var(--text-faint);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const Name = styled.h3`
  margin-top: -10px;
  font-size: clamp(1.6rem, 2.4vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.1;
`

const Pieces = styled.p`
  font-size: 14px;

  strong {
    font-weight: 700;
  }
`

const SizeGuide = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  margin-top: -8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;

  svg {
    width: 18px;
    height: 18px;
  }
`

const Actions = styled.div`
  display: grid;
  gap: 10px;
`

const Hint = styled.p`
  min-height: 1.2em;
  margin-top: -8px;
  color: var(--petrol);
  font-size: 12px;
  font-weight: 600;
`

const Perks = styled.ul`
  display: grid;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  color: var(--text-muted);
  font-size: 13px;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  svg {
    width: 20px;
    height: 20px;
    color: var(--ink);
  }
`

function QuickViewContent({ product, initialVariant }: { product: Product; initialVariant: Variant }) {
  const p = usePurchase(product, initialVariant)
  const { openInfo } = useStore()
  const { images } = p.variant
  const photos = [images.main, images.hover, ...(images.gallery ?? [])]
  const [photo, setPhoto] = useState(0)

  const changeColor = (variant: Variant) => {
    p.setVariant(variant)
    setPhoto(0)
  }

  return (
    <Grid>
      <Gallery>
        <Main>
          <Picture image={photos[photo] ?? photos[0]} sizes="(max-width: 639px) 100vw, 50vw" />
        </Main>
        <Thumbs>
          {photos.map((img, i) => (
            <Thumb
              key={img.src}
              type="button"
              $active={i === photo}
              aria-label={`Ver foto ${i + 1} de ${photos.length}`}
              aria-pressed={i === photo}
              onClick={() => setPhoto(i)}
            >
              <Picture image={img} decorative sizes="72px" />
            </Thumb>
          ))}
        </Thumbs>
      </Gallery>

      <Details>
        <Meta>
          {product.category} · Ref. {product.ref}
        </Meta>
        <Name>{product.name}</Name>
        <PriceTag price={product.price} compareAt={product.compareAt} large />
        <Swatches variants={product.variants} value={p.variant} onChange={changeColor} />
        <p>{product.description}</p>
        <Pieces>
          <strong>Inclui:</strong> {product.pieces.join(' + ')}
        </Pieces>

        <SizePicker sizes={product.sizes} soldOut={product.soldOut} value={p.size} onChange={p.choose} />
        <SizeGuide type="button" onClick={() => openInfo('tamanhos')}>
          <Ruler /> Guia de tamanhos
        </SizeGuide>

        <Actions>
          <Button variant="primary" block glyph={WhatsApp} href={p.buyUrl} {...external}>
            Comprar pelo WhatsApp
          </Button>
          <Button as="button" variant="outline" block glyph={Bag} onClick={p.addToBag}>
            Adicionar à sacola
          </Button>
          <Button
            as="button"
            variant="outline"
            size="sm"
            block
            glyph={p.favorite ? HeartFilled : Heart}
            aria-pressed={p.favorite}
            onClick={p.toggleFavorite}
          >
            {p.favorite ? 'Nos favoritos' : 'Favoritar'}
          </Button>
        </Actions>
        <Hint role="status">{p.needSize ? 'Escolha um tamanho para adicionar à sacola.' : ''}</Hint>

        <Perks>
          <li>
            <Truck /> Frete grátis acima de R$ {SHOP.freeShippingFrom}
          </li>
          <li>
            <Repeat /> Primeira troca grátis em até 7 dias
          </li>
        </Perks>
      </Details>
    </Grid>
  )
}

/** Janela “visualizar produto”, aberta pelos cards. */
export function QuickView() {
  const { quickView, closeQuickView } = useStore()
  return (
    <Dialog open={quickView !== null} onClose={closeQuickView} title="Visualizar produto" width={1040}>
      {/* `key` reinicia tamanho e foto ao trocar de produto */}
      {quickView && (
        <QuickViewContent
          key={quickView.product.id}
          product={quickView.product}
          initialVariant={quickView.variant}
        />
      )}
    </Dialog>
  )
}
