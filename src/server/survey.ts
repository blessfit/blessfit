/*
 * Pesquisa “Próximas peças”: valida e grava as respostas, monta os totais do painel e a planilha.
 * Nada do que vem do navegador é confiável: toda escolha é conferida contra src/data/survey.ts.
 */
import 'server-only'
import ExcelJS from 'exceljs'
import type { Size } from '@/data/catalog'
import {
  isSurveyOpen,
  labelOf,
  piecesFor,
  SURVEY,
  SURVEY_ACTIVITIES,
  SURVEY_COLORS,
  SURVEY_PATTERNS,
  SURVEY_PIECES,
  SURVEY_PRICES,
  SURVEY_SIZES,
  SURVEY_WHO,
  type Pattern,
  type Who,
} from '@/data/survey'
import { db } from './supabase'

export type SurveyRow = {
  id: string
  campaign: string
  who: Who
  pieces: string[]
  colors: string[]
  other_color: string | null
  pattern: Pattern
  size: Size
  price_range: string
  activities: string[]
  name: string | null
  phone: string | null
  email: string | null
  consent: boolean
  consent_at: string | null
  created_at: string
  updated_at: string
}

type NewRow = Omit<SurveyRow, 'id' | 'created_at' | 'updated_at' | 'consent_at'> & {
  consent_at: string | null
  consent_text: string | null
}

export type ParseResult = { ok: true; row: NewRow | null } | { ok: false; status: number; error: string }

const fail = (error: string, status = 400): ParseResult => ({ ok: false, status, error })

/** Lista de ids sem repetição, todos dentro de `allowed`. null se algo estiver errado. */
function ids(value: unknown, allowed: string[], max: number): string[] | null {
  if (!Array.isArray(value) || value.length > max) return null
  if (!value.every((v): v is string => typeof v === 'string' && allowed.includes(v))) return null
  return new Set(value).size === value.length ? value : null
}

/** Texto livre de uma linha: sem quebras nem caracteres de controle, cortado em `max`. Vazio → null. */
function line(value: unknown, max: number): string | null | undefined {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return undefined
  // eslint-disable-next-line no-control-regex
  const text = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length > max) return undefined
  return text || null
}

/** (37) 99999-0000, +55 37 99999-0000 → 37999990000. null se vazio, undefined se inválido. */
function phone(value: unknown): string | null | undefined {
  const text = line(value, 30)
  if (text === undefined) return undefined
  if (text === null) return null
  let digits = text.replace(/\D/g, '')
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2)
  return /^[1-9]{2}9?\d{8}$/.test(digits) ? digits : undefined
}

function email(value: unknown): string | null | undefined {
  const text = line(value, 254)
  if (text === undefined) return undefined
  if (text === null) return null
  const lower = text.toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower) ? lower : undefined
}

/**
 * Confere o corpo do POST. `row: null` = honeypot preenchido: a resposta é aceita para o robô,
 * mas não é gravada.
 */
export function parseSurvey(body: unknown, now = new Date()): ParseResult {
  if (!body || typeof body !== 'object') return fail('Resposta inválida')
  const b = body as Record<string, unknown>

  if (b.campaign !== SURVEY.campaign || !isSurveyOpen(now)) return fail('Pesquisa encerrada', 410)
  if (typeof b.website === 'string' && b.website.trim() !== '') return { ok: true, row: null }

  const who = SURVEY_WHO.find((w) => w.id === b.who)?.id
  if (!who) return fail('Escolha para quem são as peças')

  const pieces = ids(b.pieces, piecesFor(who).map((p) => p.id), SURVEY_PIECES.length)
  if (!pieces?.length) return fail('Escolha pelo menos uma peça')

  const colors = ids(b.colors, SURVEY_COLORS.map((c) => c.id), SURVEY.maxColors)
  if (!colors?.length) return fail(`Escolha de 1 a ${SURVEY.maxColors} cores`)

  const otherColor = line(b.otherColor, 40)
  if (otherColor === undefined) return fail('A outra cor pode ter até 40 letras')

  const pattern = SURVEY_PATTERNS.find((p) => p.id === b.pattern)?.id
  if (!pattern) return fail('Escolha entre liso e estampado')

  const size = SURVEY_SIZES.find((s) => s === b.size)
  if (!size) return fail('Escolha o seu tamanho')

  const price = SURVEY_PRICES.find((p) => p.id === b.price)?.id
  if (!price) return fail('Escolha quanto pagaria por um conjunto')

  const activities = b.activities === undefined ? [] : ids(b.activities, SURVEY_ACTIVITIES.map((a) => a.id), SURVEY_ACTIVITIES.length)
  if (!activities) return fail('Atividade inválida')

  const c = (b.contact && typeof b.contact === 'object' ? b.contact : {}) as Record<string, unknown>
  const name = line(c.name, 60)
  if (name === undefined) return fail('O nome pode ter até 60 letras')
  const tel = phone(c.phone)
  if (tel === undefined) return fail('Confira o WhatsApp: use DDD + número')
  const mail = email(c.email)
  if (mail === undefined) return fail('Confira o e-mail')

  const hasContact = Boolean(tel || mail)
  if (hasContact && b.consent !== true) return fail('Para receber avisos, marque a autorização')

  return {
    ok: true,
    row: {
      campaign: SURVEY.campaign,
      who,
      pieces,
      colors,
      other_color: otherColor,
      pattern,
      size,
      price_range: price,
      activities,
      // sem WhatsApp nem e-mail, a resposta é anônima (o nome sozinho não serve para avisar)
      name: hasContact ? name : null,
      phone: tel,
      email: mail,
      consent: hasContact,
      consent_at: hasContact ? now.toISOString() : null,
      consent_text: hasContact ? SURVEY.consentVersion : null,
    },
  }
}

/**
 * Grava a resposta. WhatsApp ou e-mail já usados nesta campanha: a primeira resposta vale e a nova é
 * ignorada (os índices únicos recusam). Nunca atualiza: quem soubesse o contato de outra pessoa poderia
 * trocar as respostas e o consentimento dela.
 */
export async function saveSurvey(row: NewRow): Promise<void> {
  const { error } = await db().from('survey_responses').insert(row)
  if (error && error.code !== '23505') throw error
}

// ——— Painel ———

/** Todas as respostas da campanha, da mais nova para a mais antiga. */
export async function listSurveyResponses(campaign: string = SURVEY.campaign): Promise<SurveyRow[]> {
  const rows: SurveyRow[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db()
      .from('survey_responses')
      .select('id, campaign, who, pieces, colors, other_color, pattern, size, price_range, activities, name, phone, email, consent, consent_at, created_at, updated_at')
      .eq('campaign', campaign)
      .order('created_at', { ascending: false })
      .range(from, from + 999)
      .returns<SurveyRow[]>()
    if (error) throw error
    rows.push(...data)
    if (data.length < 1000) return rows
  }
}

export type Tally = { id: string; label: string; count: number; hex?: string }

export type SurveySummary = {
  total: number
  withContact: number
  pieces: Tally[]
  colors: Tally[]
  /** Grade de tamanhos de quem marcou a peça `piece` (todas, sem filtro). */
  sizes: (Tally & { share: number })[]
  prices: Tally[]
  patterns: Tally[]
  activities: Tally[]
  otherColors: { label: string; count: number }[]
  top: { piece?: string; color?: string; size?: string; price?: string }
  /** Respostas que entraram no recorte por peça. */
  filtered: number
}

function tally(values: string[], options: { id: string; label?: string; name?: string; hex?: string }[], keepEmpty = false): Tally[] {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  const known = options.map((o) => ({ id: o.id, label: labelOf(options, o.id), hex: o.hex, count: counts.get(o.id) ?? 0 }))
  // ids que saíram da lista continuam contando, com o id cru como rótulo
  const removed = [...counts].filter(([id]) => !options.some((o) => o.id === id)).map(([id, count]) => ({ id, label: id, count }))
  return [...known, ...removed].filter((t) => keepEmpty || t.count > 0)
}

const byCount = (a: Tally, b: Tally) => b.count - a.count

export function surveySummary(rows: SurveyRow[], piece?: string): SurveySummary {
  const pieces = tally(rows.flatMap((r) => r.pieces), SURVEY_PIECES).sort(byCount)
  const colors = tally(rows.flatMap((r) => r.colors), SURVEY_COLORS).sort(byCount)
  const prices = tally(rows.map((r) => r.price_range), SURVEY_PRICES, true)

  const forSizes = piece ? rows.filter((r) => r.pieces.includes(piece)) : rows
  const sizes = tally(forSizes.map((r) => r.size), SURVEY_SIZES.map((s) => ({ id: s, label: s })), true).map((t) => ({
    ...t,
    share: forSizes.length ? Math.round((t.count / forSizes.length) * 100) : 0,
  }))

  const others = new Map<string, { label: string; count: number }>()
  for (const r of rows) {
    if (!r.other_color) continue
    const key = r.other_color.toLowerCase()
    const current = others.get(key)
    others.set(key, { label: current?.label ?? r.other_color, count: (current?.count ?? 0) + 1 })
  }

  const topSize = [...sizes].sort(byCount)[0]
  const topPrice = [...prices].sort(byCount)[0]
  return {
    total: rows.length,
    withContact: rows.filter((r) => r.consent).length,
    pieces,
    colors,
    sizes,
    prices,
    patterns: tally(rows.map((r) => r.pattern), SURVEY_PATTERNS, true),
    activities: tally(rows.flatMap((r) => r.activities), SURVEY_ACTIVITIES).sort(byCount),
    otherColors: [...others.values()].sort((a, b) => b.count - a.count).slice(0, 10),
    top: {
      piece: pieces[0]?.label,
      color: colors[0]?.label,
      size: topSize?.count ? topSize.label : undefined,
      price: topPrice?.count ? topPrice.label : undefined,
    },
    filtered: forSizes.length,
  }
}

/** Apaga nome, WhatsApp e e-mail da resposta (pedido de exclusão). A resposta continua nos totais. */
export async function anonymizeSurveyContact(id: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error('Resposta inválida')
  const { error } = await db()
    .from('survey_responses')
    .update({ name: null, phone: null, email: null, consent: false, consent_at: null, consent_text: null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/** (37) 99999-0000 */
export const formatPhone = (digits: string) =>
  digits.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')

// ——— Planilha ———

const FONT = { name: 'Arial', size: 11 }
const LINE = { style: 'thin' as const, color: { argb: 'FFD0D0D0' } }
const BORDER = { top: LINE, left: LINE, bottom: LINE, right: LINE }
const HEAD: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F1F1F' } }

/** Título, subtítulo e cabeçalho escuro na linha 4 (mesmo estilo da planilha de estoque). */
function sheet(wb: ExcelJS.Workbook, name: string, title: string, subtitle: string, headers: string[], widths: number[]) {
  const ws = wb.addWorksheet(name)
  ws.getCell('A1').value = title
  ws.getCell('A1').font = { ...FONT, size: 14, bold: true }
  ws.getCell('A2').value = subtitle
  ws.getCell('A2').font = { ...FONT, size: 9, italic: true, color: { argb: 'FF666666' } }
  headers.forEach((text, i) => {
    const cell = ws.getCell(4, i + 1)
    cell.value = text
    cell.font = { ...FONT, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = HEAD
    cell.border = BORDER
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })
  ws.getRow(4).height = 30
  widths.forEach((width, i) => (ws.getColumn(i + 1).width = width))
  ws.views = [{ state: 'frozen', ySplit: 4 }]
  return ws
}

/** Uma linha de células com fonte e borda. Textos entram como texto, nunca como fórmula. */
function row(ws: ExcelJS.Worksheet, r: number, values: ExcelJS.CellValue[], bold = false) {
  values.forEach((value, i) => {
    const cell = ws.getCell(r, i + 1)
    cell.value = value
    cell.font = { ...FONT, bold }
    cell.border = BORDER
  })
}

const excelDate = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600_000)

export async function buildSurveyWorkbook(): Promise<Buffer> {
  const rows = await listSurveyResponses()
  const summary = surveySummary(rows)
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Painel Blessfit'
  wb.created = new Date()
  const subtitle = `${SURVEY.title} · ${rows.length} resposta(s) · exportado em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date())}`
  const names = (list: { id: string; label?: string; name?: string }[], values: string[]) => values.map((v) => labelOf(list, v)).join(', ')

  // Respostas
  const answers = sheet(
    wb,
    'Respostas',
    'Respostas da pesquisa',
    subtitle,
    ['Data', 'Para quem', 'Peças', 'Cores', 'Outra cor', 'Liso/estampado', 'Tamanho', 'Pagaria (conjunto)', 'Atividades', 'Nome', 'WhatsApp', 'E-mail', 'Aceitou avisos'],
    [16, 12, 40, 32, 18, 14, 10, 18, 28, 20, 18, 28, 12],
  )
  rows.forEach((r, i) => {
    row(answers, 5 + i, [
      excelDate(r.created_at),
      labelOf(SURVEY_WHO, r.who),
      names(SURVEY_PIECES, r.pieces),
      names(SURVEY_COLORS, r.colors),
      r.other_color ?? '',
      labelOf(SURVEY_PATTERNS, r.pattern),
      r.size,
      labelOf(SURVEY_PRICES, r.price_range),
      names(SURVEY_ACTIVITIES, r.activities),
      r.name ?? '',
      r.phone ? formatPhone(r.phone) : '',
      r.email ?? '',
      r.consent ? 'Sim' : 'Não',
    ])
    answers.getCell(5 + i, 1).numFmt = 'dd/mm/yyyy hh:mm'
  })

  // Resumo
  const resume = sheet(wb, 'Resumo', 'Resumo da pesquisa', subtitle, ['Pergunta', 'Opção', 'Respostas', '% das respostas'], [22, 28, 12, 16])
  let r = 5
  const block = (title: string, list: Tally[]) => {
    for (const t of list) {
      row(resume, r, [title, t.label, t.count, rows.length ? t.count / rows.length : 0])
      resume.getCell(r, 4).numFmt = '0%'
      r++
    }
  }
  block('Peças', summary.pieces)
  block('Cores', summary.colors)
  block('Tamanho', summary.sizes)
  block('Pagaria (conjunto)', summary.prices)
  block('Liso/estampado', summary.patterns)
  block('Atividades', summary.activities)
  for (const o of summary.otherColors) row(resume, r++, ['Outra cor (texto livre)', o.label, o.count, rows.length ? o.count / rows.length : 0])

  // Grade por peça: base do pedido de produção
  const grid = sheet(wb, 'Grade por peça', 'Tamanhos de quem marcou cada peça', subtitle, ['Peça', ...SURVEY_SIZES, 'Total'], [26, 8, 8, 8, 8, 8, 10])
  r = 5
  for (const piece of summary.pieces) {
    const who = rows.filter((x) => x.pieces.includes(piece.id))
    const counts = SURVEY_SIZES.map((s) => who.filter((x) => x.size === s).length)
    row(grid, r++, [piece.label, ...counts, who.length])
  }

  return Buffer.from(await wb.xlsx.writeBuffer())
}
