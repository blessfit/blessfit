/*
 * Catálogo da loja.
 *
 * Cada produto tem uma lista de `variants` (cores). Cada cor aponta para as SUAS fotos em
 * src/data/images.ts (IMAGES.products) — ao trocar a cor no site, as fotos trocam junto.
 * Só cadastre uma cor quando tiver as fotos dela.
 *
 * `kind` define onde o produto aparece: 'Conjunto' (Lançamentos e Escolha seu conjunto)
 * ou 'Blusa' / 'Shorts' (Peças avulsas).
 * Preços em reais; `compareAt` é o preço “de” (opcional) e gera o selo de desconto.
 */
import { IMAGES, type ProductImageKey, type ProductImages } from './images'

export type Gender = 'Feminino' | 'Masculino'
export type Kind = 'Conjunto' | 'Blusa' | 'Shorts'
export type Size = 'PP' | 'P' | 'M' | 'G' | 'GG'
export type Color = { name: string; hex: string }
export type Variant = { color: Color; images: ProductImages }

export type Product = {
  id: string
  ref: string
  name: string
  gender: Gender
  kind: Kind
  category: string
  /** Cores disponíveis, cada uma com as suas fotos. A primeira é a padrão. */
  variants: Variant[]
  /** Peças que compõem o conjunto (ou detalhes da peça avulsa). */
  pieces: string[]
  description: string
  price: number
  compareAt?: number
  sizes: Size[]
  /** Tamanhos esgotados (aparecem riscados). */
  soldOut?: Size[]
  badge?: 'Lançamento' | 'Mais vendido' | 'Últimas peças'
}

const C = {
  preto: { name: 'Preto', hex: '#111114' },
  marinho: { name: 'Azul Marinho', hex: '#1f2a4d' },
  grafite: { name: 'Grafite', hex: '#3d3f45' },
  petroleo: { name: 'Azul Petróleo', hex: '#0a6a82' },
  coral: { name: 'Coral', hex: '#e8553a' },
} satisfies Record<string, Color>

/** Cor + a chave das fotos dela em IMAGES.products. */
const v = (color: Color, images: ProductImageKey): Variant => ({ color, images: IMAGES.products[images] })

export const PRODUCTS: Product[] = [
  // ——— Conjuntos femininos ———
  {
    id: 'conjunto-graca',
    ref: 'BF-F01',
    name: 'Conjunto Graça',
    gender: 'Feminino',
    kind: 'Conjunto',
    category: 'Conjunto feminino',
    variants: [v(C.petroleo, 'conjunto-graca-petroleo')],
    pieces: ['Top alças finas cruzadas', 'Shorts cós alto'],
    description: 'Top de alças finas que se cruzam em Y nas costas e shorts de cós alto que não marca nem enrola.',
    price: 199.9,
    compareAt: 229.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
  {
    id: 'conjunto-aurora',
    ref: 'BF-F02',
    name: 'Conjunto Aurora',
    gender: 'Feminino',
    kind: 'Conjunto',
    category: 'Conjunto feminino',
    variants: [v(C.coral, 'conjunto-aurora-coral')],
    pieces: ['Top nadador', 'Shorts modelador'],
    description: 'Top nadador de sustentação média e shorts modelador com cós anatômico.',
    price: 189.9,
    sizes: ['PP', 'P', 'M', 'G'],
    soldOut: ['G'],
    badge: 'Últimas peças',
  },
  {
    id: 'conjunto-renovo',
    ref: 'BF-F03',
    name: 'Conjunto Renovo',
    gender: 'Feminino',
    kind: 'Conjunto',
    category: 'Conjunto feminino',
    variants: [v(C.preto, 'conjunto-renovo-preto')],
    pieces: ['Top cropped', 'Shorts com cordão'],
    description: 'Top cropped de alta sustentação e shorts com cordão ajustável para correr e treinar.',
    price: 209.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },

  // ——— Conjuntos masculinos ———
  {
    id: 'conjunto-forca',
    ref: 'BF-M01',
    name: 'Conjunto Força',
    gender: 'Masculino',
    kind: 'Conjunto',
    category: 'Conjunto masculino',
    variants: [v(C.preto, 'conjunto-forca-preto'), v(C.marinho, 'conjunto-forca-marinho')],
    pieces: ['Camiseta raglan Dry', 'Shorts com cordão e bolsos'],
    description: 'Camiseta raglan leve com o logo b.f e shorts com cós elástico, cordão e bolsos laterais.',
    price: 229.9,
    compareAt: 259.9,
    sizes: ['P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
  {
    id: 'conjunto-fundamento',
    ref: 'BF-M02',
    name: 'Conjunto Fundamento',
    gender: 'Masculino',
    kind: 'Conjunto',
    category: 'Conjunto masculino',
    variants: [v(C.grafite, 'conjunto-fundamento-grafite')],
    pieces: ['Camiseta Oversized', 'Shorts 2 em 1'],
    description: 'Camiseta de caimento solto e shorts 2 em 1 com bermuda interna de compressão.',
    price: 249.9,
    sizes: ['P', 'M', 'G', 'GG'],
    soldOut: ['P'],
    badge: 'Mais vendido',
  },
  {
    id: 'conjunto-proposito',
    ref: 'BF-M03',
    name: 'Conjunto Propósito',
    gender: 'Masculino',
    kind: 'Conjunto',
    category: 'Conjunto masculino',
    variants: [v(C.preto, 'conjunto-proposito-preto')],
    pieces: ['Camiseta Raglan', 'Shorts Runner'],
    description: 'Camiseta raglan com recortes de ventilação e shorts runner com secagem rápida.',
    price: 219.9,
    sizes: ['P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },

  // ——— Peças avulsas ———
  {
    id: 'top-graca',
    ref: 'BF-F01-T',
    name: 'Top Graça',
    gender: 'Feminino',
    kind: 'Blusa',
    category: 'Top feminino',
    variants: [v(C.petroleo, 'top-graca-petroleo')],
    pieces: ['Alças finas cruzadas em Y', 'Bojo removível'],
    description: 'Top de alças finas que se cruzam nas costas, com elástico largo na base e logo b.f no peito.',
    price: 99.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
  },
  {
    id: 'shorts-graca',
    ref: 'BF-F01-S',
    name: 'Shorts Graça',
    gender: 'Feminino',
    kind: 'Shorts',
    category: 'Shorts feminino',
    variants: [v(C.petroleo, 'shorts-graca-petroleo')],
    pieces: ['Cós alto', 'Comprimento meia-coxa'],
    description: 'Shorts de cós alto que não marca nem enrola, com logo b.f na frente e blessfit nas costas.',
    price: 109.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
  },
  {
    id: 'camiseta-forca',
    ref: 'BF-M01-C',
    name: 'Camiseta Força',
    gender: 'Masculino',
    kind: 'Blusa',
    category: 'Camiseta masculina',
    variants: [v(C.preto, 'camiseta-forca-preto'), v(C.marinho, 'camiseta-forca-marinho')],
    pieces: ['Manga raglan', 'Tecido Dry'],
    description: 'Camiseta raglan leve e respirável, com logo b.f no peito e blessfit nas costas.',
    price: 119.9,
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: 'shorts-forca',
    ref: 'BF-M01-S',
    name: 'Shorts Força',
    gender: 'Masculino',
    kind: 'Shorts',
    category: 'Shorts masculino',
    variants: [v(C.preto, 'shorts-forca-preto'), v(C.marinho, 'shorts-forca-marinho')],
    pieces: ['Cós elástico com cordão', 'Bolsos laterais'],
    description: 'Shorts com cós elástico, cordão ajustável, bolsos laterais e logo b.f na perna.',
    price: 119.9,
    sizes: ['P', 'M', 'G', 'GG'],
  },
]

export const SETS = PRODUCTS.filter((p) => p.kind === 'Conjunto')
export const PIECES = PRODUCTS.filter((p) => p.kind !== 'Conjunto')

export const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id)

/** Variante (cor) pelo nome; cai na primeira se a cor não existir mais. */
export const findVariant = (product: Product, colorName?: string): Variant =>
  product.variants.find((variant) => variant.color.name === colorName) ?? product.variants[0]
