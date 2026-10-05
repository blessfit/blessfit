/*
 * Conteúdo da landing page da blessfit.
 * Edite textos, produtos e contatos aqui — os componentes só leem estes dados.
 */
import backBlack from '@/assets/img/back-black.webp'
import backMen from '@/assets/img/back-men.webp'
import fabricTeal from '@/assets/img/fabric-teal.webp'
import legsBlack from '@/assets/img/legs-black.webp'
import modelBlack from '@/assets/img/model-black.webp'
import modelMen from '@/assets/img/model-men.webp'
import modelTeal from '@/assets/img/model-teal.webp'
import shortsMen from '@/assets/img/shorts-men.webp'
import shortsTeal from '@/assets/img/shorts-teal.webp'
import strapsTeal from '@/assets/img/straps-teal.webp'
import tankBlack from '@/assets/img/tank-black.webp'
import teeMen from '@/assets/img/tee-men.webp'
import topTeal from '@/assets/img/top-teal.webp'
import waistBlack from '@/assets/img/waist-black.webp'
import waistMen from '@/assets/img/waist-men.webp'
import waistTeal from '@/assets/img/waist-teal.webp'

export const SITE = {
  name: 'blessfit',
  // TODO: número oficial do WhatsApp com DDI + DDD, só dígitos (ex.: 5511999999999)
  whatsapp: '5500000000000',
  // TODO: confirme o @ oficial do Instagram
  instagram: 'blessfit',
  hashtag: '#TreineComPropósito',
  tagline: 'Faith · Strength · Purpose',
  verseRef: '1 Co 6:19-20',
}

export const NAV = [
  { href: '#colecao', label: 'Coleção' },
  { href: '#detalhes', label: 'Detalhes' },
  { href: '#proposito', label: 'Propósito' },
  { href: '#comunidade', label: 'Comunidade' },
  { href: '#faq', label: 'FAQ' },
]

export const HERO = {
  main: { src: modelTeal, alt: 'Modelo vestindo o conjunto top e shorts blessfit azul petróleo' },
  second: { src: modelMen, alt: 'Modelo vestindo o conjunto camiseta e bermuda blessfit preto' },
}

export const VALUES = [
  { title: 'Conforto', text: 'Toque macio e liberdade para você se movimentar sem distrações.' },
  { title: 'Performance', text: 'Tecido leve, respirável e de secagem rápida para você render mais.' },
  { title: 'Estilo', text: 'Design minimalista que vai do treino ao dia a dia.' },
]

export const PRODUCTS = [
  {
    id: 'conjunto-top-shorts-petroleo',
    name: 'Conjunto Top + Shorts',
    line: 'Feminino',
    color: { name: 'Azul Petróleo', hex: '#0a6a82' },
    image: { src: modelTeal, alt: 'Conjunto top e shorts azul petróleo vestido pela modelo' },
    hover: { src: topTeal, alt: 'Top azul petróleo com alças duplas' },
    description: 'Top com alças duplas nas costas e shorts de cós alto para treinar com segurança e liberdade.',
    highlights: ['Alças duplas', 'Cós alto', 'Secagem rápida'],
  },
  {
    id: 'regata-legging-preto',
    name: 'Regata + Legging',
    line: 'Feminino',
    color: { name: 'Preto', hex: '#101014' },
    image: { src: modelBlack, alt: 'Regata blessfit 1 Co 6:19-20 e legging preta vestidas pela modelo' },
    hover: { src: backBlack, alt: 'Costas da regata preta blessfit' },
    description: 'Regata leve com a assinatura 1 Co 6:19-20 e legging de cós alto que acompanha cada movimento.',
    highlights: ['Caimento perfeito', 'Cós alto', 'Toque macio'],
  },
  {
    id: 'conjunto-camiseta-bermuda-preto',
    name: 'Conjunto Camiseta + Bermuda',
    line: 'Masculino',
    color: { name: 'Preto', hex: '#101014' },
    image: { src: modelMen, alt: 'Conjunto camiseta e bermuda preto vestido pelo modelo' },
    hover: { src: backMen, alt: 'Costas da camiseta e bermuda pretas blessfit' },
    description: 'Camiseta de gola careca com acabamento reforçado e bermuda com cós elástico e cordão ajustável.',
    highlights: ['Gola reforçada', 'Cordão ajustável', 'Alta elasticidade'],
  },
]

export const DETAILS = [
  {
    img: strapsTeal,
    alt: 'Costas do top azul petróleo com alças duplas cruzadas',
    title: 'Alças duplas nas costas',
    text: 'Mais sustentação e liberdade para os movimentos.',
  },
  {
    img: waistTeal,
    alt: 'Cós alto do shorts azul petróleo com o logo b.f',
    title: 'Cós alto',
    text: 'Mais segurança e conforto em qualquer treino.',
  },
  {
    img: teeMen,
    alt: 'Gola careca da camiseta preta com o logo b.f',
    title: 'Gola careca reforçada',
    text: 'Acabamento reforçado que mantém a forma.',
  },
  {
    img: waistMen,
    alt: 'Cós elástico com cordão da bermuda preta',
    title: 'Cordão ajustável',
    text: 'Cós elástico com cordão para o ajuste ideal.',
  },
  {
    img: tankBlack,
    alt: 'Regata preta com a estampa blessfit 1 Co 6:19-20',
    title: 'Caimento perfeito',
    text: 'Regata leve com a assinatura 1 Co 6:19-20.',
  },
  {
    img: waistBlack,
    alt: 'Cós alto da legging preta com o logo b.f',
    title: 'Legging de cós alto',
    text: 'Firmeza e conforto do agachamento ao cardio.',
  },
]

export const FEATURES_IMAGE = {
  src: fabricTeal,
  alt: 'Close do tecido azul petróleo com costura de acabamento',
}

export const FEATURES = [
  {
    icon: 'feather',
    title: 'Leve e respirável',
    text: 'Ventilação na medida para você render do aquecimento ao último set.',
  },
  {
    icon: 'drop',
    title: 'Secagem rápida',
    text: 'Seca rápido para você seguir confortável durante e depois do treino.',
  },
  {
    icon: 'stretch',
    title: 'Alta elasticidade',
    text: 'Acompanha cada agachamento, alongamento e passada sem limitar o movimento.',
  },
  {
    icon: 'waves',
    title: 'Toque macio',
    text: 'Sensação suave na pele, do primeiro ao último movimento.',
  },
  {
    icon: 'diamond',
    title: 'Alta durabilidade',
    text: 'Peças feitas para acompanhar a sua rotina por muito mais tempo.',
  },
  {
    icon: 'dumbbell',
    title: 'Do treino ao dia a dia',
    text: 'Estilo minimalista para sair da academia direto para a rotina.',
  },
]

// 1 Coríntios 6:19-20 — Nova Versão Internacional (NVI)
export const VERSE = {
  segments: [
    { t: '“Acaso não sabem que o corpo de vocês é' },
    { t: 'templo do Espírito Santo,', em: true },
    {
      t: 'que está em vocês, o qual receberam de Deus? Vocês não são de vocês mesmos; foram comprados por um preço. Portanto,',
    },
    { t: 'glorifiquem a Deus com o corpo de vocês.”', em: true },
  ],
  ref: '1 Coríntios 6:19-20',
  version: 'NVI',
}

export const PILLARS = [
  {
    en: 'Faith',
    pt: 'Fé',
    text: 'Tudo começa por dentro. Treinamos com gratidão por cada fôlego, cada conquista e cada novo dia.',
    img: backBlack,
  },
  {
    en: 'Strength',
    pt: 'Força',
    text: 'Força se constrói todos os dias: uma repetição de cada vez, com disciplina e constância.',
    img: backMen,
  },
  {
    en: 'Purpose',
    pt: 'Propósito',
    text: 'Cuidar do corpo é honrar quem o criou. Movimento também é propósito.',
    img: legsBlack,
  },
]

export const COMMUNITY = [
  { src: topTeal, alt: 'Top azul petróleo blessfit' },
  { src: legsBlack, alt: 'Legging preta blessfit em movimento' },
  { src: shortsMen, alt: 'Bermuda preta masculina blessfit' },
  { src: modelBlack, alt: 'Modelo com regata e legging pretas blessfit' },
  { src: shortsTeal, alt: 'Shorts azul petróleo blessfit' },
  { src: teeMen, alt: 'Camiseta preta masculina blessfit' },
]

// TODO: revise as respostas com a política real de trocas e entregas da marca
export const FAQ = [
  {
    q: 'Como faço para comprar?',
    a: 'Escolha sua peça e toque em “Quero o meu”. Você será direcionado ao nosso WhatsApp, onde tiramos dúvidas sobre tamanho e finalizamos o pedido com você.',
  },
  {
    q: 'Como escolher o tamanho certo?',
    a: 'Nossas peças têm modelagem ajustada ao corpo. Se estiver entre dois tamanhos, chame a gente no WhatsApp com suas medidas que ajudamos você a escolher.',
  },
  {
    q: 'Como funciona a entrega?',
    a: 'Depois da confirmação do pedido, informamos o prazo e o valor do frete para o seu CEP e enviamos o código de rastreio assim que a peça for postada.',
  },
  {
    q: 'Posso trocar se não servir?',
    a: 'Pode, sim. Fale com a gente em até 7 dias após o recebimento para combinarmos a troca. A peça precisa estar sem uso e com a etiqueta.',
  },
  {
    q: 'Como cuidar das minhas peças?',
    a: 'Lave do avesso, à mão ou em ciclo delicado com água fria. Evite alvejante e amaciante, seque à sombra e não passe ferro sobre a estampa — assim o tecido mantém a elasticidade e a cor por muito mais tempo.',
  },
  {
    q: 'O que significa “1 Co 6:19-20”?',
    a: 'É o versículo que inspira a blessfit: 1 Coríntios 6:19-20 lembra que o nosso corpo é templo do Espírito Santo. Por isso cuidamos dele com gratidão — e vestimos essa mensagem em cada peça.',
  },
]
