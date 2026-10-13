import { useId, useMemo, useRef, useState } from 'react'
import { Picture, Search } from '@/components/ui'
import type { Product } from '@/data/products'
import { useCatalog } from '@/store/catalogContext'
import { formatBRL } from '@/lib/price'
import { useStore } from '@/store/storeContext'
import * as S from './Header.styles'

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const haystack = (p: Product) =>
  normalize([p.name, p.gender, p.category, p.ref, ...p.pieces, p.kind, ...p.variants.map((v) => v.color.name)].join(' '))

/** Busca de produtos com sugestões ao digitar; abre o produto escolhido no “visualizar”. */
export function SearchBox() {
  const { openQuickView } = useStore()
  const { products } = useCatalog()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLFormElement>(null)
  const listId = useId()

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean)
    if (!terms.length) return []
    return products.filter((p) => {
      const text = haystack(p)
      return terms.every((t) => text.includes(t))
    })
  }, [query, products])

  const pick = (product: Product) => {
    openQuickView(product)
    setOpen(false)
    setQuery('')
  }

  const showList = open && query.trim().length > 0

  return (
    <S.Search
      ref={root}
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        if (results[0]) pick(results[0])
      }}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false)
      }}
    >
      <Search />
      <input
        type="search"
        placeholder="Buscar conjuntos, tops, shorts…"
        aria-label="Buscar produtos"
        aria-controls={listId}
        aria-expanded={showList}
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setQuery('')
            setOpen(false)
          }
        }}
      />

      {showList && (
        <S.Results id={listId}>
          {results.length === 0 ? (
            <S.Empty>Nenhum produto para “{query}”.</S.Empty>
          ) : (
            results.map((product) => (
              <li key={product.id}>
                <S.Result type="button" onClick={() => pick(product)}>
                  <span>
                    <Picture image={product.variants[0].images.main} decorative sizes="48px" />
                  </span>
                  <span>
                    <strong>{product.name}</strong>
                    <small>
                      {product.category} · {product.variants.map((v) => v.color.name).join(', ')}
                    </small>
                  </span>
                  <b>{formatBRL(product.price)}</b>
                </S.Result>
              </li>
            ))
          )}
        </S.Results>
      )}
    </S.Search>
  )
}
