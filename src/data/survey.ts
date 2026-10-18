/*
 * Pesquisa “Próximas peças” (docs/spec-proximas-pecas.md): campanha e opções do formulário.
 * A página, a API (validação) e o painel (rótulos) leem daqui.
 *
 * Dentro de uma campanha, um id nunca é renomeado nem reaproveitado: as respostas gravadas apontam para ele.
 * Para trocar as perguntas, crie uma campanha nova.
 */
import { CATALOG, type Size } from './catalog'

export const SURVEY = {
  campaign: 'proximas-pecas-2026',
  title: 'Próximas Peças 2026',
  /** Depois disso a página mostra “Pesquisa encerrada” e a API recusa respostas. */
  closesAt: '2026-11-15T23:59:59-03:00',
  maxColors: 4,
  /** Versão do texto de consentimento gravada com cada contato. Mude junto com CONSENT_TEXT. */
  consentVersion: '2026-10-16',
} as const

export const CONSENT_TEXT = 'Aceito receber mensagens da BlessFit sobre lançamentos e promoções. Posso cancelar quando quiser.'

export const isSurveyOpen = (now = new Date()) => now <= new Date(SURVEY.closesAt)

export type Option = { id: string; label: string }

/** 'f' feminino · 'm' masculino · 'a' os dois. */
export type Who = 'f' | 'm' | 'a'

export const SURVEY_WHO: { id: Who; label: string }[] = [
  { id: 'f', label: 'Feminino' },
  { id: 'm', label: 'Masculino' },
  { id: 'a', label: 'Os dois' },
]

/** `who`: 'f', 'm' ou 'u' (serve para os dois). `image`: caminho em /public, quando houver (seção 3.1 da spec). */
export type SurveyPiece = Option & { who: 'f' | 'm' | 'u'; isNew?: boolean; image?: string }

export const SURVEY_PIECES: SurveyPiece[] = [
  // atuais
  { id: 'conjunto', label: 'Conjunto', who: 'u' },
  { id: 'legging', label: 'Legging', who: 'f' },
  { id: 'top', label: 'Top', who: 'f' },
  { id: 'shorts', label: 'Shorts', who: 'u' },
  { id: 'regata', label: 'Regata', who: 'u' },
  { id: 'camiseta', label: 'Camiseta', who: 'm' },
  // novas — femininas
  { id: 'macaquinho', label: 'Macaquinho', who: 'f', isNew: true },
  { id: 'flare', label: 'Legging flare', who: 'f', isNew: true },
  { id: 'ciclista', label: 'Bermuda ciclista', who: 'f', isNew: true },
  { id: 'saia', label: 'Saia-shorts', who: 'f', isNew: true },
  { id: 'cropped', label: 'Cropped manga longa', who: 'f', isNew: true },
  // novas — masculinas
  { id: 'shorts2em1', label: 'Shorts 2 em 1', who: 'm', isNew: true },
  // novas — para os dois
  { id: 'oversized', label: 'Camiseta oversized', who: 'u', isNew: true },
  { id: 'jogger', label: 'Calça jogger', who: 'u', isNew: true },
  { id: 'jaqueta', label: 'Jaqueta corta-vento', who: 'u', isNew: true },
]

/** Peças que aparecem para quem escolheu `who`. */
export const piecesFor = (who: Who) => SURVEY_PIECES.filter((p) => who === 'a' || p.who === 'u' || p.who === who)

export type SurveyColor = { id: string; name: string; hex: string; isNew?: boolean }

const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')

/** Cores que a loja vende hoje: as mesmas do catálogo, na ordem em que aparecem. */
export const SURVEY_COLORS_NOW: SurveyColor[] = [
  ...new Map(CATALOG.flatMap((p) => p.variants.map((v) => [v.color.name, v.color] as const))).values(),
].map((c) => ({ id: slug(c.name), name: c.name, hex: c.hex }))

export const SURVEY_COLORS_NEW: SurveyColor[] = [
  { id: 'salvia', name: 'Verde Sálvia', hex: '#9caf88' },
  { id: 'oliva', name: 'Verde Oliva', hex: '#5f6b3a' },
  { id: 'menta', name: 'Verde Menta', hex: '#a8dcc6' },
  { id: 'mocha', name: 'Mocha', hex: '#7b5e4b' },
  { id: 'terracota', name: 'Terracota', hex: '#b5573a' },
  { id: 'areia', name: 'Areia', hex: '#cdbfa8' },
  { id: 'rosaantigo', name: 'Rosa Antigo', hex: '#d4a5a5' },
  { id: 'lavanda', name: 'Lavanda', hex: '#b9a6d3' },
  { id: 'azulnuvem', name: 'Azul Nuvem', hex: '#a9c3dc' },
  { id: 'vinho', name: 'Vinho', hex: '#6e1f2e' },
].map((c) => ({ ...c, isNew: true }))

export const SURVEY_COLORS: SurveyColor[] = [...SURVEY_COLORS_NOW, ...SURVEY_COLORS_NEW]

export type Pattern = 'liso' | 'estampa' | 'tanto'

export const SURVEY_PATTERNS: { id: Pattern; label: string }[] = [
  { id: 'liso', label: 'Liso' },
  { id: 'estampa', label: 'Estampado' },
  { id: 'tanto', label: 'Tanto faz' },
]

export const SURVEY_SIZES: Size[] = ['P', 'M', 'G', 'GG']

// baseadas nos conjuntos do site (cartão): Maré 139,90 · Fôlego 147,90 · Impulso 154,90 · Brisa 159,90 · Aurora 164,90
export const SURVEY_PRICES: Option[] = [
  { id: 'p1', label: 'Até R$ 130' },
  { id: 'p2', label: 'R$ 130 a R$ 160' },
  { id: 'p3', label: 'R$ 160 a R$ 190' },
  { id: 'p4', label: 'Acima de R$ 190' },
]

export const SURVEY_ACTIVITIES: Option[] = [
  { id: 'academia', label: 'Academia' },
  { id: 'corrida', label: 'Corrida' },
  { id: 'yoga', label: 'Yoga / Pilates' },
  { id: 'funcional', label: 'Funcional / Cross' },
  { id: 'dia', label: 'Dia a dia' },
]

/** Corpo do POST /api/proximas-pecas (o mesmo formato que a página guarda como rascunho). */
export type SurveyAnswers = {
  campaign: string
  who: Who
  pieces: string[]
  colors: string[]
  otherColor: string
  pattern: Pattern | ''
  size: Size | ''
  price: string
  activities: string[]
  contact: { name: string; phone: string; email: string }
  consent: boolean
  /** Honeypot: campo escondido. Gente de verdade deixa vazio. */
  website: string
}

/** Rótulo de uma opção pelo id (o id cru quando a opção já saiu da lista). */
export const labelOf = (list: { id: string; label?: string; name?: string }[], id: string) => {
  const item = list.find((o) => o.id === id)
  return item?.label ?? item?.name ?? id
}
