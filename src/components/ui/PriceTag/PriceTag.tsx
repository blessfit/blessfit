import styled from 'styled-components'
import { SHOP } from '@/data/shop'
import { discountPercent, formatBRL, installment } from '@/lib/price'
import { srOnly } from '@/styles/mixins'

const Root = styled.div<{ $large?: boolean }>`
  display: grid;
  gap: 2px;
  color: var(--text-muted);
  font-size: ${({ $large }) => ($large ? '15px' : '13px')};
  line-height: 1.45;
`

const Row = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin-bottom: 2px;
`

const Price = styled.span<{ $large?: boolean }>`
  color: var(--ink);
  font-size: ${({ $large }) => ($large ? '1.9rem' : '1.25rem')};
  font-weight: 800;
  letter-spacing: -0.02em;
`

const PixLabel = styled.span`
  color: var(--petrol);
  font-weight: 700;
`

const Was = styled.s`
  color: var(--text-faint);
`

const Off = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--mint-soft);
  color: var(--petrol-deep);
  font-size: 11px;
  font-weight: 750;
`

const Sr = styled.span`
  ${srOnly}
`

type PriceTagProps = { price: number; pix: number; compareAt?: number; large?: boolean }

/** Preço no Pix em destaque (o menor), preço “de” e, embaixo, o preço no cartão com o parcelamento. */
export function PriceTag({ price, pix, compareAt, large }: PriceTagProps) {
  const off = discountPercent(price, compareAt)
  return (
    <Root $large={large}>
      <Row>
        {off > 0 && compareAt && (
          <Was>
            <Sr>De </Sr>
            {formatBRL(compareAt)}
          </Was>
        )}
        <Price $large={large}>
          {off > 0 && <Sr>por </Sr>}
          {formatBRL(pix)}
        </Price>
        <PixLabel>no Pix</PixLabel>
        {off > 0 && <Off>-{off}%</Off>}
      </Row>
      <p>
        ou {formatBRL(price)} em até {SHOP.installments}x de {formatBRL(installment(price))} sem juros
      </p>
    </Root>
  )
}
