/*
 * Textos das seções da loja (categorias, benefícios, sobre, avaliações, FAQ e rodapé).
 * Edite aqui — os componentes só leem estes dados.
 */
import type { StaticImageData } from 'next/image'
import amex from '@/assets/img/pagamento/amex.svg'
import elo from '@/assets/img/pagamento/elo.svg'
import mastercard from '@/assets/img/pagamento/mastercard.svg'
import pix from '@/assets/img/pagamento/pix.svg'
import visa from '@/assets/img/pagamento/visa.svg'
import { IMAGES, type Img } from './images'
import { SHOP } from './shop'

export type Category = {
  label: string
  caption: string
  image: Img
  /** Âncora da página ou, se `whatsapp` vier preenchido, mensagem para o WhatsApp. */
  href?: `#${string}`
  whatsapp?: string
}

export const CATEGORIES: Category[] = [
  { label: 'Feminino', caption: 'Tops e shorts', image: IMAGES.categories.feminino, href: '#feminino' },
  { label: 'Masculino', caption: 'Camisetas e shorts', image: IMAGES.categories.masculino, href: '#masculino' },
  { label: 'Conjuntos', caption: 'Combinações prontas', image: IMAGES.categories.conjuntos, href: '#conjuntos' },
  { label: 'Shorts', caption: 'Peças avulsas', image: IMAGES.categories.shorts, href: '#shorts' },
  { label: 'Blusas', caption: 'Tops e camisetas', image: IMAGES.categories.blusas, href: '#blusas' },
]

export type BenefitIcon = 'waves' | 'stretch' | 'drop' | 'dumbbell'
export type Benefit = { icon: BenefitIcon; title: string; text: string }

export const BENEFITS: Benefit[] = [
  {
    icon: 'waves',
    title: 'Tecido confortável',
    text: 'Toque macio e respirável, do aquecimento ao último set.',
  },
  {
    icon: 'stretch',
    title: 'Alta elasticidade',
    text: 'Acompanha agachamentos, passadas e alongamentos sem limitar o movimento.',
  },
  {
    icon: 'drop',
    title: 'Secagem rápida',
    text: 'Afasta o suor da pele para você seguir confortável durante e depois do treino.',
  },
  {
    icon: 'dumbbell',
    title: 'Modelagem funcional',
    text: 'Cós que não enrola, costuras planas e recortes pensados para cada treino.',
  },
]

export type Pillar = { title: string; label: string; text: string; image: Img }

export const ABOUT = {
  eyebrow: 'Sobre a Blessfit',
  title: 'Feita para acompanhar o seu movimento.',
  text: 'A Blessfit nasceu para unir conforto, performance e estilo em peças que vão do treino ao dia a dia. Cada modelagem é testada em movimento, com tecidos que respiram e acabamento pensado nos detalhes — para todo mundo que se movimenta, do jeito que for.',
  quote: '“Peças que acompanham você do primeiro agachamento ao último compromisso do dia.”',
  quoteBy: 'Blessfit',
  pillars: [
    {
      title: 'Conforto',
      label: 'Toque macio',
      text: 'Tecidos leves e respiráveis, que vestem bem do aquecimento ao fim do dia.',
      image: IMAGES.about.comfort,
    },
    {
      title: 'Performance',
      label: 'Feita para treinar',
      text: 'Elasticidade, secagem rápida e cós que não enrola, para você focar só no movimento.',
      image: IMAGES.about.performance,
    },
    {
      title: 'Estilo',
      label: 'Do treino à rua',
      text: 'Design minimalista e cores versáteis para sair da academia direto para a rotina.',
      image: IMAGES.about.style,
    },
  ] satisfies Pillar[],
}

/*
 * Avaliações que as clientes mandaram no Instagram (direct, story ou comentário), com foto.
 * Para adicionar uma: salve o print em src/assets/img/avaliacoes/ (.webp em duas larguras, ex.:
 * nome-600.webp e nome-1170.webp), registre em IMAGES.reviews (data/images.ts) e cole em `url` o link
 * do post ou do destaque do story (no Instagram: ··· › Copiar link). Sem `url`, abre o perfil da loja.
 * No card a foto aparece cortada (4:5) e o texto resumido; ao clicar, abre inteira com a mensagem toda.
 * Peça autorização da cliente antes de publicar.
 */
export type Review = {
  name: string
  /** @ da cliente no Instagram, sem o @ */
  handle?: string
  /** Nota de 1 a 5 que ela deu às peças. */
  rating: number
  /**
   * O que ela comprou: `id` do produto e nome da cor, como em data/catalog.ts. O selo “Comprou” do card
   * coloca essas peças na sacola sem tamanho, e a pessoa escolhe o tamanho lá.
   */
  items: { id: string; color: string }[]
  /** A mensagem, do jeito que ela escreveu. */
  text: string
  photo: Img
  /** Link do post, reel ou destaque no Instagram. */
  url?: string
}

export const REVIEWS: Review[] = [
  {
    // TODO: link do destaque, se o story estiver salvo (sem ele, o botão abre o perfil da loja)
    name: 'Clara Almeida',
    handle: 'claraamelo',
    rating: 5,
    items: [
      { id: 'regata-brisa', color: 'Branco' },
      { id: 'shorts-mare', color: 'Azul Petróleo' },
    ],
    text: 'Eu amei todas as peças que escolhi! Tenho dificuldade em achar short zero transparência e esse realmente é, além de não subir. Amei demais! 💚',
    photo: IMAGES.reviews.sextou,
  },
]

export const COMMUNITY = {
  title: `Comunidade ${SHOP.hashtag}`,
  text: `Marque @${SHOP.instagram} nos seus treinos e apareça por aqui.`,
  images: IMAGES.community,
}

export type FaqItem = { q: string; a: string }

// TODO: revise as respostas com a política real de trocas e entregas da marca
export const FAQ: FaqItem[] = [
  {
    q: 'Como faço para comprar?',
    a: 'Escolha a cor e o tamanho, adicione à sacola e toque em “Finalizar pelo WhatsApp”. A conversa já abre com o nome, a cor, o tamanho e a quantidade de cada peça — a gente confirma o estoque, o frete e o pagamento com você.',
  },
  {
    q: 'Como escolher o tamanho certo?',
    a: 'Consulte o Guia de tamanhos no rodapé. Nossas peças têm modelagem ajustada; se estiver entre dois tamanhos, prefira o maior ou chame a gente no WhatsApp com suas medidas.',
  },
  {
    q: 'Quais são as formas de pagamento?',
    a: `Pix com desconto em cada peça, cartão de crédito em até ${SHOP.installments}x sem juros ou link de pagamento.`,
  },
  {
    q: 'Como funciona a entrega?',
    a: `Enviamos para todo o Brasil. O prazo e o frete são calculados pelo seu CEP, e o frete é grátis acima de R$ ${SHOP.freeShippingFrom}. Você recebe o código de rastreio assim que o pedido for postado.`,
  },
  {
    q: 'Posso trocar se não servir?',
    a: 'Pode, sim. A primeira troca é por nossa conta: fale com a gente em até 7 dias após o recebimento. A peça precisa estar sem uso e com a etiqueta.',
  },
  {
    q: 'Como cuidar das minhas peças?',
    a: 'Lave do avesso, à mão ou em ciclo delicado com água fria. Evite alvejante e amaciante, seque à sombra e não passe ferro sobre a estampa — assim o tecido mantém a elasticidade e a cor por muito mais tempo.',
  },
]

/** Conteúdo das janelas abertas pelo rodapé (troca, entrega, pagamento e tamanhos). */
export type InfoPage = {
  id: 'trocas' | 'entrega' | 'pagamento' | 'tamanhos'
  title: string
  paragraphs: string[]
  table?: { head: string[]; rows: string[][]; note?: string }
}

// TODO: revise com as políticas e medidas reais da marca
export const INFO_PAGES: InfoPage[] = [
  {
    id: 'trocas',
    title: 'Política de troca',
    paragraphs: [
      'Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução pelo WhatsApp.',
      'A peça deve estar sem uso, sem lavagem e com a etiqueta. A primeira troca por tamanho tem frete por nossa conta.',
      'Em caso de defeito de fabricação, trocamos a peça ou devolvemos o valor integral.',
    ],
  },
  {
    id: 'entrega',
    title: 'Entrega',
    paragraphs: [
      'Enviamos para todo o Brasil pelos Correios ou transportadora, com código de rastreio.',
      'Pedidos confirmados até 14h em dias úteis são postados no mesmo dia.',
      `Frete grátis nas compras acima de R$ ${SHOP.freeShippingFrom}. Abaixo disso, o valor é calculado pelo seu CEP no atendimento.`,
    ],
  },
  {
    id: 'pagamento',
    title: 'Formas de pagamento',
    paragraphs: [
      'Pix: preço com desconto em cada peça, com confirmação na hora.',
      `Cartão de crédito: em até ${SHOP.installments}x sem juros pelo link de pagamento seguro.`,
      `Primeira compra? Use o cupom ${SHOP.firstPurchaseCoupon.code} e ganhe ${SHOP.firstPurchaseCoupon.percent}% OFF.`,
    ],
  },
  {
    id: 'tamanhos',
    title: 'Guia de tamanhos',
    paragraphs: ['Medidas do corpo em centímetros. Se estiver entre dois tamanhos, prefira o maior.'],
    table: {
      head: ['Tamanho', 'Busto / Tórax', 'Cintura', 'Quadril'],
      rows: [
        ['PP', '78–82', '60–64', '86–90'],
        ['P', '83–88', '65–70', '91–96'],
        ['M', '89–94', '71–76', '97–102'],
        ['G', '95–102', '77–84', '103–110'],
        ['GG', '103–110', '85–92', '111–118'],
      ],
      note: 'Ainda em dúvida? Envie suas medidas no WhatsApp que indicamos o tamanho ideal.',
    },
  },
]

/** Bandeiras do rodapé; os logos ficam em src/assets/img/pagamento/. */
export const PAYMENT_METHODS: { name: string; logo: StaticImageData }[] = [
  { name: 'Pix', logo: pix },
  { name: 'Visa', logo: visa },
  { name: 'Mastercard', logo: mastercard },
  { name: 'Elo', logo: elo },
  { name: 'Amex', logo: amex },
]
