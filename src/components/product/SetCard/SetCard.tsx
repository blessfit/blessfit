import { useState } from 'react'
import styled from 'styled-components'
import {
  Bag,
  Button,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  IconButton,
  Picture,
  PriceTag,
  SizePicker,
  Swatches,
} from '@/components/ui'
import type { Product, Variant } from '@/data/products'
import { media } from '@/styles/media'
import { usePurchase } from '../usePurchase'

const Card = styled.article`
  display: grid;
  grid-template-rows: auto 1fr;
  border-radius: var(--radius);
  background: var(--white);
  overflow: hidden;

  ${media.md} {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
    grid-template-rows: none;
  }

  ${media.sm} {
    grid-template-columns: 1fr;
  }
`

/** A foto inteira abre o “visualizar” (no celular é onde as pessoas tocam). */
const ImageButton = styled.button`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  cursor: pointer;

  &:focus-visible {
    outline-offset: -4px;
  }
`

/** Setas para passar as fotos do conjunto sem abrir o “visualizar”. */
const PhotoArrow = styled(IconButton)<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => $side}: 10px;
  transform: translateY(-50%);
  background: rgb(255 255 255 / 0.9);

  svg {
    width: 18px;
    height: 18px;
  }
`

/** Bolinhas que mostram qual foto está aparecendo. */
const PhotoDots = styled.span`
  position: absolute;
  right: 14px;
  bottom: 24px;
  display: flex;
  gap: 5px;
  pointer-events: none;

  i {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.6);
    box-shadow: 0 0 0 1px rgb(11 11 15 / 0.15);
    transition: width 0.3s var(--ease);
  }

  i[data-active] {
    width: 16px;
    background: var(--white);
  }
`

const Media = styled.div`
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--surface);

  ${media.md} {
    aspect-ratio: auto;
    min-height: 100%;
  }

  ${media.sm} {
    aspect-ratio: 4 / 4.2;
  }
`

const Color = styled.span`
  position: absolute;
  left: 14px;
  bottom: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px 7px 8px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.92);
  font-size: 12px;
  font-weight: 650;

  i {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgb(11 11 15 / 0.15);
  }
`

const Tools = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;

  svg {
    width: 20px;
    height: 20px;
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: clamp(20px, 2.4vw, 28px);
`

const Ref = styled.p`
  color: var(--text-faint);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const Name = styled.h3`
  margin-top: -10px;
  font-size: clamp(1.3rem, 1.8vw, 1.55rem);
  font-weight: 800;
  letter-spacing: -0.03em;
`

const Text = styled.p`
  color: var(--text-muted);
  font-size: 14px;
`

const Pieces = styled.ul`
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--paper);
  font-size: 13px;
  font-weight: 600;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  svg {
    width: 16px;
    height: 16px;
    color: var(--petrol);
  }
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
`

const Hint = styled.p`
  margin-top: -8px;
  min-height: 1.2em;
  color: var(--petrol);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
`

/** Card editorial de conjunto: mostra as peças incluídas, descrição, tamanhos e compra. */
export function SetCard({ product }: { product: Product }) {
  const p = usePurchase(product)
  const color = p.variant.color
  const { images } = p.variant
  const photos = [images.main, images.hover, ...(images.gallery ?? [])]
  const [photo, setPhoto] = useState(0)
  const current = Math.min(photo, photos.length - 1)
  const step = (delta: number) => setPhoto((current + delta + photos.length) % photos.length)

  const changeColor = (variant: Variant) => {
    p.setVariant(variant)
    setPhoto(0)
  }

  return (
    <Card aria-labelledby={`set-${product.id}`}>
      <Media>
        <ImageButton type="button" onClick={p.view} aria-label={`Visualizar ${product.name}`}>
          <Picture image={photos[current]} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 45vw, 30vw" />
        </ImageButton>
        {photos.length > 1 && (
          <>
            <PhotoArrow
              $side="left"
              $variant="float"
              $size={38}
              type="button"
              aria-label="Foto anterior"
              onClick={() => step(-1)}
            >
              <ChevronLeft />
            </PhotoArrow>
            <PhotoArrow
              $side="right"
              $variant="float"
              $size={38}
              type="button"
              aria-label="Próxima foto"
              onClick={() => step(1)}
            >
              <ChevronRight />
            </PhotoArrow>
            <PhotoDots aria-hidden="true">
              {photos.map((img, i) => (
                <i key={img.src} data-active={i === current || undefined} />
              ))}
            </PhotoDots>
          </>
        )}
        <Color>
          <i style={{ background: color.hex }} />
          {color.name}
        </Color>
        <Tools>
          <IconButton $variant="float" type="button" aria-label={`Visualizar ${product.name}`} onClick={p.view}>
            <Eye />
          </IconButton>
        </Tools>
      </Media>

      <Body>
        <Ref>
          {product.gender} · Ref. {product.ref}
        </Ref>
        <Name id={`set-${product.id}`}>{product.name}</Name>
        <Text>{product.description}</Text>
        <Swatches variants={product.variants} value={p.variant} onChange={changeColor} />

        <Pieces aria-label="Peças do conjunto">
          {product.pieces.map((piece) => (
            <li key={piece}>
              <Check />
              {piece}
            </li>
          ))}
        </Pieces>

        <SizePicker sizes={product.sizes} soldOut={p.variant.soldOut} value={p.size} onChange={p.choose} compact />

        <PriceTag price={product.price} pix={product.pix} compareAt={product.compareAt} />

        <Actions>
          <Button
            as="button"
            variant="primary"
            block
            glyph={Bag}
            aria-label={`Adicionar ${product.name} à sacola`}
            onClick={p.addToBag}
          >
            Adicionar à sacola
          </Button>
        </Actions>
        <Hint role="status">{p.needSize ? 'Escolha um tamanho para adicionar à sacola.' : ''}</Hint>
      </Body>
    </Card>
  )
}
