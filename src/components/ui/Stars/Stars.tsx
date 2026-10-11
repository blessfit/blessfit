import styled from 'styled-components'
import { StarFilled } from '../Icons'

const Root = styled.span`
  display: inline-flex;
  gap: 2px;

  svg {
    width: 15px;
    height: 15px;
  }
`

const Star = styled.span<{ $on: boolean }>`
  color: ${({ $on }) => ($on ? 'var(--ink)' : 'var(--line-strong)')};
`

/** Nota de 0 a 5 em estrelas. */
export function Stars({ rating }: { rating: number }) {
  return (
    <Root role="img" aria-label={`Nota ${rating} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} $on={i < rating}>
          <StarFilled />
        </Star>
      ))}
    </Root>
  )
}
