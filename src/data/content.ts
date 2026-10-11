/*
 * Textos das seções da loja (categorias, benefícios, propósito, avaliações, FAQ e rodapé).
 * Edite aqui — os componentes só leem estes dados.
 */
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

export type Pillar = { en: string; pt: string; text: string; image: Img }

export const PURPOSE = {
  eyebrow: 'Sobre a Blessfit',
  title: 'Vestimos quem treina com fé.',
  text: 'A Blessfit nasceu da vontade de unir cuidado com o corpo e gratidão a Deus. Cada peça é desenhada para performar no treino e carregar uma mensagem: o corpo é templo, e cuidar dele também é adoração.',
  verse: '“Glorifiquem a Deus com o corpo de vocês.”',
  verseRef: '1 Coríntios 6:20',
  pillars: [
    {
      en: 'Faith',
      pt: 'Fé',
      text: 'Tudo começa por dentro. Treinamos com gratidão por cada fôlego, cada conquista e cada novo dia.',
      image: IMAGES.purpose.faith,
    },
    {
      en: 'Strength',
      pt: 'Força',
      text: 'Força se constrói todos os dias: uma repetição de cada vez, com disciplina e constância.',
      image: IMAGES.purpose.strength,
    },
    {
      en: 'Purpose',
      pt: 'Propósito',
      text: 'Cuidar do corpo é honrar quem o criou. Movimento também é propósito.',
      image: IMAGES.purpose.purpose,
    },
  ] satisfies Pillar[],
}

// TODO: troque pelos depoimentos reais das clientes (com autorização)
export type Review = { name: string; city: string; product: string; rating: number; text: string }

export const REVIEWS: Review[] = [
  {
    name: 'Camila R.',
    city: 'Belo Horizonte, MG',
    product: 'Conjunto Graça',
    rating: 5,
    text: 'O shorts não sobe nem enrola no agachamento, e o top segura de verdade. Já estou de olho na próxima cor!',
  },
  {
    name: 'Rafael M.',
    city: 'Curitiba, PR',
    product: 'Conjunto Força',
    rating: 5,
    text: 'Tecido leve e seca muito rápido. Comprei pelo WhatsApp, me ajudaram com o tamanho e chegou em 3 dias.',
  },
  {
    name: 'Juliana S.',
    city: 'São Paulo, SP',
    product: 'Conjunto Aurora',
    rating: 5,
    text: 'Além de lindo, tem propósito. Treinar com uma peça que lembra que meu corpo é templo faz diferença.',
  },
  {
    name: 'Lucas A.',
    city: 'Recife, PE',
    product: 'Conjunto Fundamento',
    rating: 4,
    text: 'O 2 em 1 é perfeito para correr. Caimento ótimo e acabamento caprichado.',
  },
]

export const COMMUNITY = {
  title: 'Comunidade #TreineComPropósito',
  text: `Marque @${SHOP.instagram} nos seus treinos e apareça por aqui.`,
  images: IMAGES.community,
}

export type FaqItem = { q: string; a: string }

// TODO: revise as respostas com a política real de trocas e entregas da marca
export const FAQ: FaqItem[] = [
  {
    q: 'Como faço para comprar?',
    a: 'Escolha o tamanho e toque em “Comprar”, ou monte sua sacola e finalize pelo WhatsApp. A conversa já abre com o produto, a cor e o tamanho — a gente confirma o estoque, o frete e o pagamento com você.',
  },
  {
    q: 'Como escolher o tamanho certo?',
    a: 'Consulte o Guia de tamanhos no rodapé. Nossas peças têm modelagem ajustada; se estiver entre dois tamanhos, prefira o maior ou chame a gente no WhatsApp com suas medidas.',
  },
  {
    q: 'Quais são as formas de pagamento?',
    a: `Pix com ${Math.round(SHOP.pixDiscount * 100)}% de desconto, cartão de crédito em até ${SHOP.installments}x sem juros ou link de pagamento.`,
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
    q: 'O que significa “1 Co 6:19-20”?',
    a: 'É o versículo que inspira a Blessfit: 1 Coríntios 6:19-20 lembra que o nosso corpo é templo do Espírito Santo. Por isso cuidamos dele com gratidão — e vestimos essa mensagem em cada peça.',
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
      `Pix: ${Math.round(SHOP.pixDiscount * 100)}% de desconto, com confirmação na hora.`,
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

export const PAYMENT_METHODS = ['Pix', 'Visa', 'Mastercard', 'Elo', 'Amex']
