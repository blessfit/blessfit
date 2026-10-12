/*
 * Configurações gerais da loja: contatos, condições comerciais e textos do topo da página.
 * Edite aqui — os componentes só leem estes dados.
 */
import { IMAGES, type Img } from './images'

export const SHOP = {
  name: 'Blessfit',
  // TODO: número oficial do WhatsApp com DDI + DDD, só dígitos (ex.: 5511999999999)
  whatsapp: '5500000000000',
  // TODO: confirme o @ oficial do Instagram
  instagram: 'blessfit',
  hashtag: '#MovimentoBlessfit',
  tagline: 'Conforto · Performance · Estilo',

  /** Condições comerciais usadas nos cards, na sacola e na barra de benefícios. */
  freeShippingFrom: 299,
  installments: 3,
  /** 0.05 = 5% de desconto no Pix */
  pixDiscount: 0.05,
  firstPurchaseCoupon: { code: 'BLESS10', percent: 10 },
} as const

export const ANNOUNCEMENTS: string[] = [
  `Frete grátis nas compras acima de R$ ${SHOP.freeShippingFrom}`,
  `${SHOP.firstPurchaseCoupon.percent}% OFF na primeira compra com o cupom ${SHOP.firstPurchaseCoupon.code}`,
  `${SHOP.installments}x sem juros no cartão · ${Math.round(SHOP.pixDiscount * 100)}% OFF no Pix`,
]

export type NavItem = { href: `#${string}`; label: string }

/** Menu principal. `#feminino` e `#masculino` abrem a aba certa em “Escolha seu conjunto”. */
export const NAV: NavItem[] = [
  { href: '#feminino', label: 'Feminino' },
  { href: '#masculino', label: 'Masculino' },
  { href: '#lancamentos', label: 'Lançamentos' },
  { href: '#categorias', label: 'Coleções' },
  { href: '#sobre', label: 'Sobre' },
]

export type HeroSlide = {
  image: Img
  /** Ponto focal no celular (o banner fica vertical e a foto é recortada). */
  mobileFocus?: string
  eyebrow: string
  title: string
  text: string
  primary: { label: string; href: `#${string}` }
  secondary?: { label: string; href: `#${string}` }
  /** Lado do texto no desktop — deixe a pessoa da foto do lado oposto. */
  align: 'left' | 'right'
}

/** Slides do banner principal (carrossel). A ordem aqui é a ordem na tela. */
export const HERO_SLIDES: HeroSlide[] = [
  {
    image: IMAGES.heroSlides[0],
    mobileFocus: '68% 50%',
    eyebrow: 'Nova coleção · 2026',
    title: 'Feita para o seu movimento.',
    text: 'Roupas fitness com conforto, performance e estilo — do treino ao dia a dia.',
    primary: { label: 'Comprar coleção', href: '#lancamentos' },
    secondary: { label: 'Conheça a Blessfit', href: '#sobre' },
    align: 'left',
  },
  {
    image: IMAGES.heroSlides[1],
    mobileFocus: '30% 50%',
    eyebrow: 'Linha masculina',
    title: 'Leve para treinar pesado.',
    text: 'Conjuntos Impulso e Fôlego em preto e azul marinho: respiráveis, com secagem rápida e caimento certo.',
    primary: { label: 'Ver masculino', href: '#masculino' },
    align: 'right',
  },
  {
    image: IMAGES.heroSlides[2],
    mobileFocus: '72% 50%',
    eyebrow: 'Linha feminina',
    title: 'Leveza em cada movimento.',
    text: 'Conjunto Maré: top de alças cruzadas e shorts de cós alto que não marca nem enrola.',
    primary: { label: 'Ver feminino', href: '#feminino' },
    align: 'left',
  },
  {
    image: IMAGES.heroSlides[3],
    mobileFocus: '36% 50%',
    eyebrow: 'Peças avulsas',
    title: 'Monte do seu jeito.',
    text: `Tops, regatas, camisetas, shorts e leggings vendidos separadamente. ${SHOP.installments}x sem juros ou ${Math.round(SHOP.pixDiscount * 100)}% OFF no Pix.`,
    primary: { label: 'Montar meu look', href: '#pecas' },
    align: 'right',
  },
]
