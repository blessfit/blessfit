import { useState } from 'react'
import type { Product, Size, Variant } from '@/data/products'
import { useStore } from '@/store/storeContext'

/** Estado de compra de um produto: cor e tamanho escolhidos, sacola. */
export function usePurchase(product: Product, initialVariant?: Variant) {
  const store = useStore()
  const [variant, setVariant] = useState<Variant>(initialVariant ?? product.variants[0])
  const [size, setSize] = useState<Size | null>(null)
  const [needSize, setNeedSize] = useState(false)

  const choose = (next: Size) => {
    setSize(next)
    setNeedSize(false)
  }

  const addToBag = () => {
    if (!size) {
      setNeedSize(true)
      return
    }
    store.addToBag(product, variant, size)
  }

  return {
    /** Cor escolhida — as fotos vêm dela (`variant.images`). */
    variant,
    setVariant,
    size,
    choose,
    /** true quando a pessoa tentou adicionar à sacola sem escolher tamanho */
    needSize,
    addToBag,
    /** Abre o “visualizar” já na cor escolhida. */
    view: () => store.openQuickView(product, variant),
  }
}
