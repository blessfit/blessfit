import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { InfoPage } from '@/data/content'
import { findVariant, type Product, type Size, type Variant } from '@/data/products'
import { useCatalog } from './catalogContext'
import type { BagLine } from '@/lib/orders'
import { StoreContext, type BagItem, type BagKey, type Panel, type StoreState } from './storeContext'

/** `selected` ausente = marcado (sacolas salvas antes da seleção existir). `size` null = falta escolher. */
type StoredLine = { id: string; color: string; size: Size | null; qty: number; selected?: boolean }

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

const isLine = (l: StoredLine, line: BagKey) =>
  l.id === line.product.id && l.color === line.variant.color.name && l.size === line.size

const hasSize = (l: BagItem): l is BagItem & BagLine => l.size !== null

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

  const addToBag = useCallback((product: Product, variant: Variant, size: Size | null = null) => {
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
  const setQty = useCallback((line: BagKey, qty: number) => {
    setStored((lines) => lines.map((l) => (isLine(l, line) ? { ...l, qty: Math.max(0, qty) } : l)))
  }, [])

  // escolher um tamanho que já está na sacola (mesma peça e cor) junta os dois itens
  const setSize = useCallback((line: BagKey, size: Size) => {
    setStored((lines) => {
      const current = lines.find((l) => isLine(l, line))
      if (!current || current.size === size) return lines
      const twin = lines.find((l) => l !== current && isLine(l, { ...line, size }))
      if (!twin) return lines.map((l) => (l === current ? { ...l, size } : l))
      return lines
        .filter((l) => l !== current)
        .map((l) => (l === twin ? { ...l, qty: l.qty + current.qty, selected: true } : l))
    })
  }, [])

  const setSelected = useCallback((line: BagKey, selected: boolean) => {
    setStored((lines) => lines.map((l) => (isLine(l, line) ? { ...l, selected } : l)))
  }, [])

  const selectAll = useCallback((selected: boolean) => {
    setStored((lines) => lines.map((l) => ({ ...l, selected })))
  }, [])

  const removeFromBag = useCallback((line: BagKey) => {
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
    const marked = bag.filter((l) => l.selected && l.qty > 0)
    const checkoutLines: BagLine[] = marked
      .filter(hasSize)
      .map(({ product, variant, size, qty }) => ({ product, variant, size, qty }))

    return {
      bag,
      bagCount: bag.length,
      checkoutLines,
      needSize: marked.filter((l) => !hasSize(l)),
      checkoutCount: checkoutLines.reduce((n, l) => n + l.qty, 0),
      bagTotal: checkoutLines.reduce((sum, l) => sum + l.product.price * l.qty, 0),
      bagPixTotal: checkoutLines.reduce((sum, l) => sum + l.product.pix * l.qty, 0),
      addToBag,
      setQty,
      setSize,
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
  }, [findProduct, stored, panel, quickView, info, addToBag, setQty, setSize, setSelected, selectAll, removeFromBag])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
