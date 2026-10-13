import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { InfoPage } from '@/data/content'
import { findVariant, type Product, type Size, type Variant } from '@/data/products'
import { useCatalog } from './catalogContext'
import type { BagLine } from '@/lib/orders'
import { StoreContext, type Panel, type StoreState } from './storeContext'

type StoredLine = { id: string; color: string; size: Size; qty: number }

const FAVORITES_KEY = 'blessfit:favoritos'
const BAG_KEY = 'blessfit:sacola:v2'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // navegação privada / armazenamento bloqueado: segue só em memória
  }
}

/** Estado da loja: favoritos e sacola (salvos no navegador) e as janelas abertas. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { findProduct } = useCatalog()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [stored, setStored] = useState<StoredLine[]>([])
  const [loaded, setLoaded] = useState(false)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [quickView, setQuickView] = useState<StoreState['quickView']>(null)
  const [info, setInfo] = useState<InfoPage['id'] | null>(null)

  // o servidor não tem o localStorage: a sacola salva entra depois da primeira renderização
  useEffect(() => {
    setFavoriteIds(load(FAVORITES_KEY, []))
    setStored(load(BAG_KEY, []))
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (loaded) save(FAVORITES_KEY, favoriteIds)
  }, [loaded, favoriteIds])
  useEffect(() => {
    if (loaded) save(BAG_KEY, stored)
  }, [loaded, stored])

  const toggleFavorite = useCallback((product: Product) => {
    setFavoriteIds((ids) => (ids.includes(product.id) ? ids.filter((id) => id !== product.id) : [...ids, product.id]))
  }, [])

  const addToBag = useCallback((product: Product, variant: Variant, size: Size) => {
    const color = variant.color.name
    setStored((lines) => {
      const found = lines.find((l) => l.id === product.id && l.color === color && l.size === size)
      if (found) return lines.map((l) => (l === found ? { ...l, qty: l.qty + 1 } : l))
      return [...lines, { id: product.id, color, size, qty: 1 }]
    })
    setQuickView(null)
    setPanel('bag')
  }, [])

  const setQty = useCallback((line: BagLine, qty: number) => {
    setStored((lines) =>
      lines
        .map((l) =>
          l.id === line.product.id && l.color === line.variant.color.name && l.size === line.size ? { ...l, qty } : l,
        )
        .filter((l) => l.qty > 0),
    )
  }, [])

  const value = useMemo<StoreState>(() => {
    // produtos removidos do catálogo somem da sacola e dos favoritos
    const bag = stored.flatMap((l) => {
      const product = findProduct(l.id)
      return product ? [{ product, variant: findVariant(product, l.color), size: l.size, qty: l.qty }] : []
    })
    const favorites = favoriteIds.flatMap((id) => findProduct(id) ?? [])

    return {
      favorites,
      isFavorite: (id) => favoriteIds.includes(id),
      toggleFavorite,
      bag,
      bagCount: bag.reduce((n, l) => n + l.qty, 0),
      bagTotal: bag.reduce((sum, l) => sum + l.product.price * l.qty, 0),
      bagPixTotal: bag.reduce((sum, l) => sum + l.product.pix * l.qty, 0),
      addToBag,
      setQty,
      panel,
      openPanel: setPanel,
      closePanel: () => setPanel(null),
      quickView,
      openQuickView: (product, variant) => setQuickView({ product, variant: variant ?? product.variants[0] }),
      closeQuickView: () => setQuickView(null),
      info,
      openInfo: setInfo,
      closeInfo: () => setInfo(null),
    }
  }, [findProduct, favoriteIds, stored, panel, quickView, info, toggleFavorite, addToBag, setQty])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
