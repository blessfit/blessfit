import styled from 'styled-components'
import {
  Bag,
  Button,
  Check,
  Eye,
  Heart,
  HeartFilled,
  IconButton,
  Picture,
  PriceTag,
  SizePicker,
  Swatches,
  WhatsApp,
} from '@/components/ui'
import type { Product } from '@/data/products'
import { external } from '@/lib/links'
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

  return (
    <Card aria-labelledby={`set-${product.id}`}>
      <Media>
        <Picture image={p.variant.images.main} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 45vw, 30vw" />
        <Color>
          <i style={{ background: color.hex }} />
          {color.name}
        </Color>
        <Tools>
          <IconButton
            $variant="float"
            type="button"
            aria-label={p.favorite ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
            aria-pressed={p.favorite}
            onClick={p.toggleFavorite}
            style={p.favorite ? { color: 'var(--petrol)' } : undefined}
          >
            {p.favorite ? <HeartFilled /> : <Heart />}
          </IconButton>
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
        <Swatches variants={product.variants} value={p.variant} onChange={p.setVariant} />

        <Pieces aria-label="Peças do conjunto">
          {product.pieces.map((piece) => (
            <li key={piece}>
              <Check />
              {piece}
            </li>
          ))}
        </Pieces>

        <SizePicker sizes={product.sizes} soldOut={product.soldOut} value={p.size} onChange={p.choose} compact />

        <PriceTag price={product.price} compareAt={product.compareAt} />

        <Actions>
          <Button variant="primary" block glyph={WhatsApp} href={p.buyUrl} {...external}>
            Comprar
          </Button>
          <IconButton
            $variant="outline"
            $size={52}
            type="button"
            aria-label={`Adicionar ${product.name} à sacola`}
            onClick={p.addToBag}
          >
            <Bag />
          </IconButton>
        </Actions>
        <Hint role="status">{p.needSize ? 'Escolha um tamanho para adicionar à sacola.' : ''}</Hint>
      </Body>
    </Card>
  )
}
