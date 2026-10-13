import {
  Bag,
  Button,
  Eye,
  Heart,
  HeartFilled,
  Picture,
  PriceTag,
  SizePicker,
  Swatches,
} from '@/components/ui'
import type { Product } from '@/data/products'
import { discountPercent } from '@/lib/price'
import { usePurchase } from '../usePurchase'
import * as S from './ProductCard.styles'

/** Card de produto da vitrine: foto grande, favoritar, visualizar, cores, tamanhos, preço e compra. */
export function ProductCard({ product }: { product: Product }) {
  const p = usePurchase(product)
  const off = discountPercent(product.price, product.compareAt)

  return (
    <S.Card aria-labelledby={`${product.id}-name`}>
      <S.Media>
        <S.ImageButton type="button" onClick={p.view} aria-label={`Visualizar ${product.name}`}>
          <Picture image={p.variant.images.main} sizes="(max-width: 639px) 84vw, (max-width: 1023px) 45vw, 25vw" />
          <S.Hover>
            <Picture image={p.variant.images.hover} decorative sizes="(max-width: 1023px) 45vw, 25vw" />
          </S.Hover>
        </S.ImageButton>

        <S.Badges>
          {product.badge && <S.Badge>{product.badge}</S.Badge>}
          {off > 0 && <S.Badge $tone="sale">-{off}%</S.Badge>}
        </S.Badges>

        <S.Tools>
          <S.Tool
            $variant="float"
            type="button"
            aria-label={p.favorite ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
            aria-pressed={p.favorite}
            $on={p.favorite}
            onClick={p.toggleFavorite}
          >
            {p.favorite ? <HeartFilled /> : <Heart />}
          </S.Tool>
          <S.Tool $variant="float" type="button" aria-label={`Visualizar ${product.name}`} onClick={p.view}>
            <Eye />
          </S.Tool>
        </S.Tools>
      </S.Media>

      <S.Info>
        <S.Meta>
          {product.category} · Ref. {product.ref}
        </S.Meta>
        <S.Name id={`${product.id}-name`}>{product.name}</S.Name>
        <Swatches variants={product.variants} value={p.variant} onChange={p.setVariant} />

        <SizePicker
          sizes={product.sizes}
          soldOut={product.soldOut}
          value={p.size}
          onChange={p.choose}
          label="Tamanho"
          hideLabel
          compact
        />

        <PriceTag price={product.price} pix={product.pix} compareAt={product.compareAt} />

        <S.Actions>
          <Button
            as="button"
            variant="primary"
            size="sm"
            block
            glyph={Bag}
            aria-label={`Adicionar ${product.name} à sacola`}
            onClick={p.addToBag}
          >
            Adicionar à sacola
          </Button>
        </S.Actions>
        <S.Hint role="status">{p.needSize ? 'Escolha um tamanho para adicionar à sacola.' : ''}</S.Hint>
      </S.Info>
    </S.Card>
  )
}
