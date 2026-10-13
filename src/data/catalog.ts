/*
 * Catálogo da loja.
 *
 * Cada produto tem uma lista de `variants` (cores). Cada cor aponta para as SUAS fotos em
 * src/data/images.ts (IMAGES.products) — ao trocar a cor no site, as fotos trocam junto.
 * Só cadastre uma cor quando tiver as fotos dela.
 *
 * `kind` define onde o produto aparece: 'Conjunto' (Lançamentos e Escolha seu conjunto)
 * ou 'Blusa' / 'Shorts' (Peças avulsas).
 * Preços em reais, iguais aos da planilha “Estoque BlessFit” (coluna Nome no site):
 * `price` é o preço no cartão e `pix` o preço no Pix. `compareAt` é o preço “de” (opcional) e gera o
 * selo de desconto — nos conjuntos é a soma das peças avulsas.
 *
 * Este arquivo só tem dados (as fotos entram em products.ts) para que o back-end em api/
 * leia os mesmos preços que o site mostra.
 */
import type { ProductImageKey } from './images'

export type Gender = 'Feminino' | 'Masculino'
export type Kind = 'Conjunto' | 'Blusa' | 'Shorts' | 'Legging'
export type Size = 'PP' | 'P' | 'M' | 'G' | 'GG'
export type Color = { name: string; hex: string }
/** Cor + a chave das fotos dela em IMAGES.products. */
export type CatalogVariant = { color: Color; images: ProductImageKey }

export type CatalogProduct = {
  id: string
  ref: string
  name: string
  gender: Gender
  kind: Kind
  category: string
  /** Cores disponíveis, cada uma com as suas fotos. A primeira é a padrão. */
  variants: CatalogVariant[]
  /** Peças que compõem o conjunto (ou detalhes da peça avulsa). */
  pieces: string[]
  description: string
  /** Preço no cartão (em até 6x sem juros). */
  price: number
  /** Preço à vista no Pix. */
  pix: number
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

const v = (color: Color, images: ProductImageKey): CatalogVariant => ({ color, images })

export const CATALOG: CatalogProduct[] = [
  // ——— Conjuntos femininos ———
  {
    id: 'conjunto-mare',
    ref: 'BF-F01',
    name: 'Conjunto Maré',
    gender: 'Feminino',
    kind: 'Conjunto',
    category: 'Conjunto feminino',
    variants: [v(C.petroleo, 'conjunto-mare-petroleo')],
    pieces: ['Top alças finas cruzadas', 'Shorts cós alto'],
    description: 'Top de alças finas que se cruzam em Y nas costas e shorts de cós alto que não marca nem enrola.',
    price: 139.9,
    pix: 129.9,
    compareAt: 154.8,
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
    price: 164.9,
    pix: 154.9,
    compareAt: 184.8,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
  {
    id: 'conjunto-brisa',
    ref: 'BF-F03',
    name: 'Conjunto Brisa',
    gender: 'Feminino',
    kind: 'Conjunto',
    category: 'Conjunto feminino',
    variants: [
      v(C.preto, 'conjunto-brisa-preto'),
      v(C.marinho, 'conjunto-brisa-marinho'),
      v(C.branco, 'conjunto-brisa-branco'),
    ],
    pieces: ['Regata estampada', 'Legging cós alto'],
    description:
      'Regata leve com a estampa blessfit e barra arredondada, com legging de cós alto que não marca. Na cor Branco, a regata vem com legging preta.',
    price: 159.9,
    pix: 149.9,
    compareAt: 179.8,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },

  // ——— Conjuntos masculinos ———
  {
    id: 'conjunto-impulso',
    ref: 'BF-M01',
    name: 'Conjunto Impulso',
    gender: 'Masculino',
    kind: 'Conjunto',
    category: 'Conjunto masculino',
    variants: [v(C.preto, 'conjunto-impulso-preto'), v(C.marinho, 'conjunto-impulso-marinho')],
    pieces: ['Camiseta raglan Dry', 'Shorts com cordão e bolsos'],
    description: 'Camiseta raglan leve com o logo b.f e shorts com cós elástico, cordão e bolsos laterais.',
    price: 154.9,
    pix: 144.9,
    compareAt: 174.8,
    sizes: ['P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
  {
    id: 'conjunto-folego',
    ref: 'BF-M02',
    name: 'Conjunto Fôlego',
    gender: 'Masculino',
    kind: 'Conjunto',
    category: 'Conjunto masculino',
    variants: [v(C.preto, 'conjunto-folego-preto'), v(C.marinho, 'conjunto-folego-marinho')],
    pieces: ['Regata cava aberta', 'Shorts com cordão e bolsos'],
    description: 'Regata leve e ventilada com o logo b.f, combinada com o shorts de cós elástico, cordão e bolsos.',
    price: 147.9,
    pix: 137.9,
    compareAt: 164.8,
    sizes: ['P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },

  // ——— Peças avulsas ———
  {
    id: 'regata-brisa',
    ref: 'BF-F03-R',
    name: 'Regata Brisa',
    gender: 'Feminino',
    kind: 'Blusa',
    category: 'Regata feminina',
    variants: [
      v(C.preto, 'regata-brisa-preto'),
      v(C.marinho, 'regata-brisa-marinho'),
      v(C.branco, 'regata-brisa-branco'),
    ],
    pieces: ['Estampa blessfit', 'Barra arredondada'],
    description: 'Regata de cava aberta e caimento solto, com a estampa blessfit no peito.',
    price: 74.9,
    pix: 69.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
  {
    id: 'legging-brisa',
    ref: 'BF-F03-L',
    name: 'Legging Brisa',
    gender: 'Feminino',
    kind: 'Legging',
    category: 'Legging feminina',
    variants: [v(C.preto, 'legging-brisa-preto'), v(C.marinho, 'legging-brisa-marinho')],
    pieces: ['Cós alto', 'Não marca nem fica transparente'],
    description: 'Legging de cós alto com logo b.f na lateral e blessfit nas costas, do agachamento ao cardio.',
    price: 104.9,
    pix: 99.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
  {
    id: 'top-mare',
    ref: 'BF-F01-T',
    name: 'Top Maré',
    gender: 'Feminino',
    kind: 'Blusa',
    category: 'Top feminino',
    variants: [v(C.petroleo, 'top-mare-petroleo')],
    pieces: ['Alças finas cruzadas em Y', 'Bojo removível'],
    description: 'Top de alças finas que se cruzam nas costas, com elástico largo na base e logo b.f no peito.',
    price: 79.9,
    pix: 74.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
  },
  {
    id: 'shorts-mare',
    ref: 'BF-F01-S',
    name: 'Shorts Maré',
    gender: 'Feminino',
    kind: 'Shorts',
    category: 'Shorts feminino',
    variants: [v(C.petroleo, 'shorts-mare-petroleo')],
    pieces: ['Cós alto', 'Comprimento meia-coxa'],
    description: 'Shorts de cós alto que não marca nem enrola, com logo b.f na frente e blessfit nas costas.',
    price: 74.9,
    pix: 69.9,
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
  },
  {
    id: 'camiseta-impulso',
    ref: 'BF-M01-C',
    name: 'Camiseta Impulso',
    gender: 'Masculino',
    kind: 'Blusa',
    category: 'Camiseta masculina',
    variants: [v(C.preto, 'camiseta-impulso-preto'), v(C.marinho, 'camiseta-impulso-marinho')],
    pieces: ['Manga raglan', 'Tecido Dry'],
    description: 'Camiseta raglan leve e respirável, com logo b.f no peito e blessfit nas costas.',
    price: 84.9,
    pix: 79.9,
    sizes: ['P', 'M', 'G', 'GG'],
  },
  {
    id: 'regata-folego',
    ref: 'BF-M02-R',
    name: 'Regata Fôlego',
    gender: 'Masculino',
    kind: 'Blusa',
    category: 'Regata masculina',
    variants: [v(C.preto, 'regata-folego-preto'), v(C.marinho, 'regata-folego-marinho')],
    pieces: ['Cava aberta', 'Tecido leve e ventilado'],
    description: 'Regata masculina de cava aberta, com logo b.f no peito e blessfit nas costas.',
    price: 74.9,
    pix: 69.9,
    sizes: ['P', 'M', 'G', 'GG'],
    badge: 'Lançamento',
  },
  {
    id: 'shorts-impulso',
    ref: 'BF-M01-S',
    name: 'Shorts Impulso',
    gender: 'Masculino',
    kind: 'Shorts',
    category: 'Shorts masculino',
    variants: [v(C.preto, 'shorts-impulso-preto'), v(C.marinho, 'shorts-impulso-marinho')],
    pieces: ['Cós elástico com cordão', 'Bolsos laterais'],
    description: 'Shorts com cós elástico, cordão ajustável, bolsos laterais e logo b.f na perna.',
    price: 89.9,
    pix: 84.9,
    sizes: ['P', 'M', 'G', 'GG'],
  },
]
