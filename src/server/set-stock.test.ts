import { describe, expect, it } from 'vitest'
import { CATALOG, stockPiecesOf } from '@/data/catalog'
import { applyLive, stockKey, stockOf, type LiveCatalog } from '@/data/live'
import { priceCart } from './orders'

const live = (stock: [string, string, string, number | null][]): LiveCatalog => ({
  products: {},
  stock: Object.fromEntries(stock.map(([id, color, size, q]) => [stockKey(id, color, size), q])),
})

describe('estoque dos conjuntos', () => {
  it('todo conjunto tem duas peças, e toda peça existe', () => {
    for (const set of CATALOG.filter((p) => p.kind === 'Conjunto')) {
      expect(set.parts, set.id).toHaveLength(2)
      for (const { color } of set.variants) {
        for (const piece of stockPiecesOf(set.id, color.name, 'M')) {
          expect(piece.id).not.toMatch(/^conjunto-/)
        }
      }
    }
  })

  it('conjunto Brisa Branco usa a legging Preto', () => {
    expect(stockPiecesOf('conjunto-brisa', 'Branco', 'G')).toEqual([
      { id: 'regata-brisa', color: 'Branco', size: 'G' },
      { id: 'legging-brisa', color: 'Preto', size: 'G' },
    ])
  })

  it('disponível = menor quantidade entre as duas peças; peça sem controle não limita', () => {
    const l = live([
      ['camiseta-impulso', 'Preto', 'M', 4],
      ['shorts-impulso', 'Preto', 'M', 5],
      ['camiseta-impulso', 'Preto', 'G', 0],
      ['shorts-impulso', 'Preto', 'G', 7],
      ['shorts-impulso', 'Preto', 'P', 3],
      // o estoque antigo do próprio conjunto é ignorado
      ['conjunto-impulso', 'Preto', 'M', 99],
    ])
    expect(stockOf(l, 'conjunto-impulso', 'Preto', 'M')).toBe(4)
    expect(stockOf(l, 'conjunto-impulso', 'Preto', 'G')).toBe(0)
    expect(stockOf(l, 'conjunto-impulso', 'Preto', 'P')).toBe(3)
    expect(stockOf(l, 'conjunto-impulso', 'Preto', 'GG')).toBeNull()
    expect(stockOf(l, 'camiseta-impulso', 'Preto', 'M')).toBe(4)

    const set = applyLive(
      CATALOG.find((p) => p.id === 'conjunto-impulso')!,
      l,
    )!
    expect(set.variants.find((v) => v.color.name === 'Preto')!.soldOut).toEqual(['G'])
  })

  it('pedido de conjunto leva as duas peças para a baixa', () => {
    const l = live([
      ['top-mare', 'Azul Petróleo', 'M', 5],
      ['shorts-mare', 'Azul Petróleo', 'M', 4],
    ])
    const result = priceCart([{ id: 'conjunto-mare', color: 'Azul Petróleo', size: 'M', qty: 2 }], 'pix', l)
    expect('items' in result && result.items[0].pieces).toEqual([
      { id: 'top-mare', color: 'Azul Petróleo', size: 'M' },
      { id: 'shorts-mare', color: 'Azul Petróleo', size: 'M' },
    ])
  })

  it('soma a peça avulsa com a do conjunto antes de conferir o estoque', () => {
    const l = live([
      ['camiseta-impulso', 'Preto', 'M', 3],
      ['shorts-impulso', 'Preto', 'M', 10],
    ])
    const ok = priceCart(
      [
        { id: 'conjunto-impulso', color: 'Preto', size: 'M', qty: 2 },
        { id: 'camiseta-impulso', color: 'Preto', size: 'M', qty: 1 },
      ],
      'pix',
      l,
    )
    expect('items' in ok).toBe(true)

    const tooMany = priceCart(
      [
        { id: 'conjunto-impulso', color: 'Preto', size: 'M', qty: 2 },
        { id: 'camiseta-impulso', color: 'Preto', size: 'M', qty: 2 },
      ],
      'pix',
      l,
    )
    expect(tooMany).toEqual({
      error: 'Só restam 3 unidades de Camiseta Impulso Preto M, somando os conjuntos e as peças da sacola',
    })
  })
})
