import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { InfoPage } from '@/data/content'
import { findVariant, type Product, type Size, type Variant } from '@/data/products'
import { useCatalog } from './catalogContext'
import type { BagLine } from '@/lib/orders'
import { StoreContext, type BagItem, type Panel, type StoreState } from './storeContext'

/** `selected` ausente = marcado (sacolas salvas antes da seleção existir). */
type StoredLine = { id: string; color: string; size: Size; qty: number; selected?: boolean }

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

const isLine = (l: StoredLine, line: BagLine) =>
  l.id === line.product.id && l.color === line.variant.color.name && l.size === line.size

/** Estado da loja: sacola (salva no navegador) e as janelas abertas. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { findProduct } = useCatalog()
  const [stored, setStored] = useState<StoredLine[]>([])
  const [loaded, setLoaded] = useState(false)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [quickView, setQuickView] = useState<StoreState['quickView']>(null)
  const [info, setInfo] = useState<InfoPage['id'] | null>(null)

  // o servidor não tem o localStorage: a sacola salva entra depois da primeira renderização
  useEffect(() => {
    setStored(load(BAG_KEY, []))
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (loaded) save(BAG_KEY, stored)
  }, [loaded, stored])

  const addToBag = useCallback((product: Product, variant: Variant, size: Size) => {
    const color = variant.color.name
    setStored((lines) => {
      const found = lines.find((l) => l.id === product.id && l.color === color && l.size === size)
      if (found) return lines.map((l) => (l === found ? { ...l, qty: l.qty + 1, selected: true } : l))
      return [...lines, { id: product.id, color, size, qty: 1, selected: true }]
    })
    setQuickView(null)
    setPanel('bag')
  }, [])

  // quantidade 0 mantém o item na sacola; só o botão remover tira
  const setQty = useCallback((line: BagLine, qty: number) => {
    setStored((lines) => lines.map((l) => (isLine(l, line) ? { ...l, qty: Math.max(0, qty) } : l)))
  }, [])

  const setSelected = useCallback((line: BagLine, selected: boolean) => {
    setStored((lines) => lines.map((l) => (isLine(l, line) ? { ...l, selected } : l)))
  }, [])

  const selectAll = useCallback((selected: boolean) => {
    setStored((lines) => lines.map((l) => ({ ...l, selected })))
  }, [])

  const removeFromBag = useCallback((line: BagLine) => {
    setStored((lines) => lines.filter((l) => !isLine(l, line)))
  }, [])

  const value = useMemo<StoreState>(() => {
    // produtos removidos do catálogo somem da sacola
    const bag = stored.flatMap<BagItem>((l) => {
      const product = findProduct(l.id)
      return product
        ? [{ product, variant: findVariant(product, l.color), size: l.size, qty: l.qty, selected: l.selected ?? true }]
        : []
    })
    const checkoutLines = bag.filter((l) => l.selected && l.qty > 0)

    return {
      bag,
      bagCount: bag.length,
      checkoutLines,
      checkoutCount: checkoutLines.reduce((n, l) => n + l.qty, 0),
      bagTotal: checkoutLines.reduce((sum, l) => sum + l.product.price * l.qty, 0),
      bagPixTotal: checkoutLines.reduce((sum, l) => sum + l.product.pix * l.qty, 0),
      addToBag,
      setQty,
      setSelected,
      selectAll,
      removeFromBag,
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
  }, [findProduct, stored, panel, quickView, info, addToBag, setQty, setSelected, selectAll, removeFromBag])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
