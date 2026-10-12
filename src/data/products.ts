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
export type Kind = 'Conjunto' | 'Blusa' | 'Shorts' | 'Legging'
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
  branco: { name: 'Branco', hex: '#f6f4ef' },
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
    variants: [v(C.preto, 'conjunto-aurora-preto')],
    pieces: ['Top nadador', 'Legging cós alto'],
    description: 'Top nadador de sustentação média com logo b.f e legging de cós alto, com blessfit nas costas das duas peças.',
    price: 199.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
  {
    id: 'conjunto-templo',
    ref: 'BF-F03',
    name: 'Conjunto Templo',
    gender: 'Feminino',
    kind: 'Conjunto',
    category: 'Conjunto feminino',
    variants: [
      v(C.preto, 'conjunto-templo-preto'),
      v(C.marinho, 'conjunto-templo-marinho'),
      v(C.branco, 'conjunto-templo-branco'),
    ],
    pieces: ['Regata 1 Co 6:19-20', 'Legging cós alto'],
    description:
      'Regata leve com a estampa 1 Co 6:19-20 e barra arredondada, com legging de cós alto que não marca. Na cor Branco, a regata vem com legging preta.',
    price: 219.9,
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
    id: 'conjunto-proposito',
    ref: 'BF-M02',
    name: 'Conjunto Propósito',
    gender: 'Masculino',
    kind: 'Conjunto',
    category: 'Conjunto masculino',
    variants: [v(C.preto, 'conjunto-proposito-preto'), v(C.marinho, 'conjunto-proposito-marinho')],
    pieces: ['Regata cava aberta', 'Shorts com cordão e bolsos'],
    description: 'Regata leve e ventilada com o logo b.f, combinada com o shorts de cós elástico, cordão e bolsos.',
    price: 209.9,
    sizes: ['P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },

  // ——— Peças avulsas ———
  {
    id: 'regata-templo',
    ref: 'BF-F03-R',
    name: 'Regata Templo',
    gender: 'Feminino',
    kind: 'Blusa',
    category: 'Regata feminina',
    variants: [
      v(C.preto, 'regata-templo-preto'),
      v(C.marinho, 'regata-templo-marinho'),
      v(C.branco, 'regata-templo-branco'),
    ],
    pieces: ['Estampa 1 Co 6:19-20', 'Barra arredondada'],
    description: 'Regata de cava aberta e caimento solto, com a estampa blessfit 1 Co 6:19-20 no peito.',
    price: 89.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
  {
    id: 'legging-templo',
    ref: 'BF-F03-L',
    name: 'Legging Templo',
    gender: 'Feminino',
    kind: 'Legging',
    category: 'Legging feminina',
    variants: [v(C.preto, 'legging-templo-preto'), v(C.marinho, 'legging-templo-marinho')],
    pieces: ['Cós alto', 'Não marca nem fica transparente'],
    description: 'Legging de cós alto com logo b.f na lateral e blessfit nas costas, do agachamento ao cardio.',
    price: 139.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
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
    id: 'regata-proposito',
    ref: 'BF-M02-R',
    name: 'Regata Propósito',
    gender: 'Masculino',
    kind: 'Blusa',
    category: 'Regata masculina',
    variants: [v(C.preto, 'regata-proposito-preto'), v(C.marinho, 'regata-proposito-marinho')],
    pieces: ['Cava aberta', 'Tecido leve e ventilado'],
    description: 'Regata masculina de cava aberta, com logo b.f no peito e blessfit nas costas.',
    price: 89.9,
    sizes: ['P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
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
