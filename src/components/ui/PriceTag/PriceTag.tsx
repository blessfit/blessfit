import styled from 'styled-components'
import { SHOP } from '@/data/shop'
import { discountPercent, formatBRL, installment, pixPrice } from '@/lib/price'
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

const Pix = styled.p`
  color: var(--petrol);
  font-weight: 650;
`

const Sr = styled.span`
  ${srOnly}
`

type PriceTagProps = { price: number; compareAt?: number; large?: boolean }

/** Preço, preço “de”, parcelamento e valor no Pix. */
export function PriceTag({ price, compareAt, large }: PriceTagProps) {
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
          {formatBRL(price)}
        </Price>
        {off > 0 && <Off>-{off}%</Off>}
      </Row>
      <p>
        ou {SHOP.installments}x de {formatBRL(installment(price))} sem juros
      </p>
      <Pix>
        {formatBRL(pixPrice(price))} no Pix ({Math.round(SHOP.pixDiscount * 100)}% OFF)
      </Pix>
    </Root>
  )
}
