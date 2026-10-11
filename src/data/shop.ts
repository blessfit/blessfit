/*
 * Configurações gerais da loja: contatos, condições comerciais e textos do topo da página.
 * Edite aqui — os componentes só leem estes dados.
 */

export const SHOP = {
  name: 'Blessfit',
  // TODO: número oficial do WhatsApp com DDI + DDD, só dígitos (ex.: 5511999999999)
  whatsapp: '5500000000000',
  // TODO: confirme o @ oficial do Instagram
  instagram: 'blessfit',
  hashtag: '#TreineComPropósito',
  tagline: 'Faith · Strength · Purpose',
  verseRef: '1 Co 6:19-20',

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
  { href: '#proposito', label: 'Propósito' },
]

export const HERO = {
  eyebrow: 'Coleção Propósito · 2026',
  title: 'Movimento também é propósito.',
  text: 'Roupas fitness para quem treina com fé, força e propósito.',
  primary: { label: 'Comprar coleção', href: '#lancamentos' },
  secondary: { label: 'Conheça nosso propósito', href: '#proposito' },
}
