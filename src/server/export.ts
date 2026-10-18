/*
 * Planilha de estoque, preços e vendas no mesmo formato da “Estoque BlessFit (com conjuntos).xlsx”:
 * abas Estoque (peças), Conjuntos e Como usar, mais Vendas (totais) e Pedidos.
 * Os números são os do sistema no momento da exportação.
 */
import 'server-only'
import ExcelJS from 'exceljs'
import { CATALOG, type CatalogProduct, type Size } from '@/data/catalog'
import { stockOf } from '@/data/live'
import { SOLD } from './admin'
import type { Order } from './orders'
import { colorCode, PIECES, SET_PARTS } from './pieces'
import { db, getLiveCatalog } from './supabase'

// ——— Estilo da planilha original ———
const FONT = { name: 'Arial', size: 11 }
const LINE = { style: 'thin' as const, color: { argb: 'FFD0D0D0' } }
const BORDER = { top: LINE, left: LINE, bottom: LINE, right: LINE }
const INPUT: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7D6' } }
const HEAD: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F1F1F' } }
const TOTAL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF1E3' } }
const BRL = '"R$ "#,##0.00'

const SIZES: Size[] = ['P', 'M', 'G', 'GG']
const GENDER = { Feminino: 'Fem', Masculino: 'Masc' } as const
const STATUS: Record<string, string> = { paid: 'Pago', review: 'Conferir pagamento', shipped: 'Enviado', delivered: 'Entregue' }

type CellOptions = { input?: boolean; money?: boolean; bold?: boolean; center?: boolean; percent?: boolean; fill?: ExcelJS.Fill }

function put(ws: ExcelJS.Worksheet, row: number, col: number, value: ExcelJS.CellValue, o: CellOptions = {}) {
  const cell = ws.getCell(row, col)
  cell.value = value
  cell.font = { ...FONT, bold: o.bold }
  cell.border = BORDER
  if (o.input || o.fill) cell.fill = o.fill ?? INPUT
  if (o.money) cell.numFmt = BRL
  if (o.percent) cell.numFmt = '0%'
  if (o.center) cell.alignment = { horizontal: 'center' }
}

/** Título, subtítulo, cabeçalho escuro na linha 4, larguras e painel congelado (como na planilha original). */
function setupSheet(ws: ExcelJS.Worksheet, title: string, subtitle: string, headers: string[], widths: number[], wrap = false) {
  ws.getCell('A1').value = title
  ws.getCell('A1').font = { ...FONT, size: 14, bold: true }
  ws.getRow(1).height = 17.4
  ws.getCell('A2').value = subtitle
  ws.getCell('A2').font = { ...FONT, size: 9, italic: true, color: { argb: 'FF666666' } }
  headers.forEach((text, i) => {
    const cell = ws.getCell(4, i + 1)
    cell.value = text
    cell.font = { ...FONT, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = HEAD
    cell.border = BORDER
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: wrap }
  })
  ws.getRow(4).height = wrap ? 32 : 30
  widths.forEach((width, i) => (ws.getColumn(i + 1).width = width))
  ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 4, topLeftCell: 'B5', activeCell: 'A5' }]
}

const note = (ws: ExcelJS.Worksheet, row: number, text: string) => {
  ws.getCell(row, 1).value = text
  ws.getCell(row, 1).font = { ...FONT, size: 9, italic: true, color: { argb: 'FF666666' } }
}

/** Data em São Paulo como data do Excel (o Excel não guarda fuso). */
const excelDate = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600_000)

function startOfDay(daysAgo: number): Date {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  const start = new Date(`${today}T00:00:00-03:00`)
  start.setUTCDate(start.getUTCDate() - daysAgo)
  return start
}

async function soldOrders(): Promise<Order[]> {
  const orders: Order[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db()
      .from('orders')
      .select('*')
      .in('status', SOLD)
      .order('paid_at', { ascending: false })
      .range(from, from + 999)
      .returns<Order[]>()
    if (error) throw error
    orders.push(...data)
    if (data.length < 1000) return orders
  }
}

const bySize = (a: string, b: string) => SIZES.indexOf(a as Size) - SIZES.indexOf(b as Size)

export async function buildWorkbook(): Promise<Buffer> {
  const [live, orders] = await Promise.all([getLiveCatalog(), soldOrders()])

  // unidades vendidas e faturamento por produto × cor × tamanho
  const sold = new Map<string, { qty: number; cents: number }>()
  for (const order of orders) {
    for (const item of order.items) {
      const key = `${item.id}|${item.color}|${item.size}`
      const current = sold.get(key) ?? { qty: 0, cents: 0 }
      sold.set(key, { qty: current.qty + item.quantity, cents: current.cents + item.price * item.quantity })
    }
  }
  const soldQty = (id: string, color: string, size: string) => sold.get(`${id}|${color}|${size}`)?.qty ?? 0

  const prices = (p: CatalogProduct) => {
    const row = live?.products[p.id]
    return {
      price: row?.price ?? p.price,
      pix: row?.pix ?? p.pix,
      compareAt: row ? row.compareAt : (p.compareAt ?? null),
      active: row?.active ?? true,
    }
  }

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Painel Blessfit'
  wb.created = new Date()
  const generatedAt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date())

  // ——— Estoque (peças avulsas) ———
  const stockWs = wb.addWorksheet('Estoque')
  setupSheet(
    stockWs,
    'ESTOQUE BLESSFIT',
    `Exportado do painel em ${generatedAt}. Entradas = saldo atual + vendas pelo site; Saídas = vendas pelo site. O saldo é calculado sozinho.`,
    ['Código', 'Produto', 'Nome no site', 'Cor', 'Gênero', 'Tamanho', 'Preço de custo', 'Preço no Pix', 'Preço em até 6x sem juros', 'Entradas', 'Saídas', 'Saldo', 'No site'],
    [20, 24, 34, 16, 10, 10, 15, 14, 16, 11, 10, 10, 11],
  )
  const pieces = CATALOG.filter((p) => p.kind !== 'Conjunto').flatMap((p) =>
    p.variants.flatMap(({ color }) => p.sizes.map((size) => ({ p, color: color.name, size }))),
  )
  pieces.sort(
    (a, b) =>
      (PIECES[a.p.ref]?.supplier ?? a.p.category).localeCompare(PIECES[b.p.ref]?.supplier ?? b.p.category, 'pt-BR') ||
      a.p.name.localeCompare(b.p.name, 'pt-BR') ||
      a.color.localeCompare(b.color, 'pt-BR') ||
      bySize(a.size, b.size),
  )
  let r = 5
  for (const { p, color, size } of pieces) {
    const info = PIECES[p.ref]
    const { price, pix, active } = prices(p)
    const balance = stockOf(live, p.id, color, size)
    const out = soldQty(p.id, color, size)
    put(stockWs, r, 1, `${p.ref}-${colorCode(color)}-${size}`, { input: true })
    put(stockWs, r, 2, info?.supplier ?? p.category, { input: true })
    put(stockWs, r, 3, p.name, { input: true })
    put(stockWs, r, 4, color, { input: true })
    put(stockWs, r, 5, GENDER[p.gender], { input: true })
    put(stockWs, r, 6, size, { input: true })
    put(stockWs, r, 7, info?.cost ?? null, { input: true, money: true })
    put(stockWs, r, 8, pix, { input: true, money: true })
    put(stockWs, r, 9, price, { input: true, money: true })
    put(stockWs, r, 10, balance === null ? null : balance + out, { input: true, center: true })
    put(stockWs, r, 11, out, { input: true, center: true })
    put(
      stockWs,
      r,
      12,
      balance === null ? 'sem controle' : { formula: `IF(A${r}="","",J${r}-K${r})`, result: balance },
      { bold: balance !== null, center: true },
    )
    put(stockWs, r, 13, active ? 'À venda' : 'Oculto', { center: true })
    stockWs.getCell(r, 5).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Fem,Masc,Unissex"'] }
    stockWs.getCell(r, 6).dataValidation = { type: 'list', allowBlank: true, formulae: ['"P,M,G,GG,XG,Único"'] }
    r++
  }
  stockWs.autoFilter = `A4:M${r - 1}`
  note(stockWs, r + 1, '“sem controle” = tamanho sem estoque cadastrado no painel (aparece sempre disponível no site).')

  // ——— Conjuntos ———
  const setWs = wb.addWorksheet('Conjuntos')
  setupSheet(
    setWs,
    'CONJUNTOS BLESSFIT',
    `Exportado do painel em ${generatedAt}. Cada conjunto é montado com 2 peças; no site o conjunto tem estoque próprio (coluna Disponível).`,
    ['Código', 'Conjunto (nome no site)', 'Peça 1', 'Peça 2', 'Cor', 'Gênero', 'Tamanho', 'Preço de custo', 'Preço no Pix', 'Preço em até 6x sem juros', 'Preço "de" (peças avulsas)', 'Desconto', 'Disponível', 'Vendidos', 'No site'],
    [16, 24, 16, 16, 26, 10, 10, 15, 14, 16, 18, 11, 12, 11, 11],
    true,
  )
  r = 5
  for (const p of CATALOG.filter((x) => x.kind === 'Conjunto')) {
    const parts = SET_PARTS[p.ref]
    const cost = parts ? parts.reduce((sum, ref) => sum + (PIECES[ref]?.cost ?? 0), 0) : null
    const { price, pix, compareAt, active } = prices(p)
    for (const { color } of p.variants) {
      for (const size of p.sizes) {
        const code = colorCode(color.name)
        const balance = stockOf(live, p.id, color.name, size)
        const discount = compareAt ? 1 - price / compareAt : ''
        put(setWs, r, 1, `${p.ref}-${code}-${size}`, { input: true })
        put(setWs, r, 2, p.name, { input: true })
        put(setWs, r, 3, parts ? `${parts[0]}-${code}-${size}` : null, { input: true })
        put(setWs, r, 4, parts ? `${parts[1]}-${code}-${size}` : null, { input: true })
        put(setWs, r, 5, color.name, { input: true })
        put(setWs, r, 6, GENDER[p.gender], { input: true })
        put(setWs, r, 7, size, { input: true })
        put(setWs, r, 8, cost, { money: true, center: true })
        put(setWs, r, 9, pix, { input: true, money: true })
        put(setWs, r, 10, price, { input: true, money: true })
        put(setWs, r, 11, compareAt, { money: true, center: true })
        put(setWs, r, 12, { formula: `IF(K${r}=0,"",1-J${r}/K${r})`, result: discount }, { bold: true, center: true, percent: true })
        put(setWs, r, 13, balance ?? 'sem controle', { bold: balance !== null, center: true })
        put(setWs, r, 14, soldQty(p.id, color.name, size), { center: true })
        put(setWs, r, 15, active ? 'À venda' : 'Oculto', { center: true })
        r++
      }
    }
  }
  setWs.autoFilter = `A4:O${r - 1}`
  note(
    setWs,
    r + 2,
    'Custo = soma das duas peças (aba Estoque). Preço "de" e Desconto vêm do painel (Preços). Disponível = estoque do conjunto no painel; “sem controle” = sempre disponível no site.',
  )

  // ——— Vendas (totais) ———
  const salesWs = wb.addWorksheet('Vendas')
  setupSheet(
    salesWs,
    'VENDAS BLESSFIT',
    `Pedidos pagos pelo site (pago, a conferir, enviado e entregue), pela data do pagamento. Exportado em ${generatedAt}.`,
    ['Período', 'Pedidos', 'Peças', 'Faturamento', 'Ticket médio'],
    [26, 12, 12, 18, 16],
  )
  const pieceCount = (o: Order) => o.items.reduce((n, i) => n + i.quantity, 0)
  const periods: [string, (o: Order) => boolean][] = [
    ['Hoje', (o) => !!o.paid_at && new Date(o.paid_at) >= startOfDay(0)],
    ['Últimos 7 dias', (o) => !!o.paid_at && new Date(o.paid_at) >= startOfDay(6)],
    ['Últimos 30 dias', (o) => !!o.paid_at && new Date(o.paid_at) >= startOfDay(29)],
    ['Pix', (o) => o.capture_method === 'pix'],
    ['Cartão', (o) => o.capture_method === 'credit_card'],
    ['Total geral', () => true],
  ]
  r = 5
  for (const [label, match] of periods) {
    const rows = orders.filter(match)
    const isTotal = label === 'Total geral'
    const style = { bold: isTotal, fill: isTotal ? TOTAL : undefined }
    put(salesWs, r, 1, label, style)
    put(salesWs, r, 2, rows.length, { ...style, center: true })
    put(salesWs, r, 3, rows.reduce((n, o) => n + pieceCount(o), 0), { ...style, center: true })
    put(salesWs, r, 4, rows.reduce((n, o) => n + o.total_cents, 0) / 100, { ...style, money: true })
    put(salesWs, r, 5, { formula: `IF(B${r}=0,0,D${r}/B${r})`, result: rows.length ? rows.reduce((n, o) => n + o.total_cents, 0) / 100 / rows.length : 0 }, { ...style, money: true })
    r++
  }

  // vendas por produto, logo abaixo
  r += 2
  salesWs.getCell(r, 1).value = 'VENDAS POR PRODUTO'
  salesWs.getCell(r, 1).font = { ...FONT, size: 12, bold: true }
  r++
  ;['Código', 'Produto', 'Cor', 'Tamanho', 'Quantidade', 'Faturamento'].forEach((text, i) => {
    const cell = salesWs.getCell(r, i + 1)
    cell.value = text
    cell.font = { ...FONT, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = HEAD
    cell.border = BORDER
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })
  salesWs.getColumn(6).width = 18
  const first = ++r
  const lines = [...sold.entries()]
    .map(([key, v]) => {
      const [id, color, size] = key.split('|')
      const p = CATALOG.find((x) => x.id === id)
      return { code: p ? `${p.ref}-${colorCode(color)}-${size}` : id, name: p?.name ?? id, color, size, ...v }
    })
    .sort((a, b) => b.cents - a.cents)
  for (const line of lines) {
    put(salesWs, r, 1, line.code)
    put(salesWs, r, 2, line.name)
    put(salesWs, r, 3, line.color)
    put(salesWs, r, 4, line.size, { center: true })
    put(salesWs, r, 5, line.qty, { center: true })
    put(salesWs, r, 6, line.cents / 100, { money: true })
    r++
  }
  if (!lines.length) {
    put(salesWs, r, 1, 'Nenhuma venda ainda')
    r++
  }
  put(salesWs, r, 1, 'TOTAL', { bold: true, fill: TOTAL })
  for (const c of [2, 3, 4]) put(salesWs, r, c, null, { fill: TOTAL })
  put(salesWs, r, 5, { formula: `SUM(E${first}:E${r - 1})`, result: lines.reduce((n, l) => n + l.qty, 0) }, { bold: true, center: true, fill: TOTAL })
  put(salesWs, r, 6, { formula: `SUM(F${first}:F${r - 1})`, result: lines.reduce((n, l) => n + l.cents, 0) / 100 }, { bold: true, money: true, fill: TOTAL })
  salesWs.getColumn(2).width = 26
  salesWs.getColumn(3).width = 16

  // ——— Pedidos ———
  const ordersWs = wb.addWorksheet('Pedidos')
  setupSheet(
    ordersWs,
    'PEDIDOS PAGOS',
    `Um pedido por linha, do mais recente para o mais antigo. Exportado em ${generatedAt}.`,
    ['Pago em', 'Pedido', 'Cliente', 'Telefone', 'E-mail', 'Itens', 'Peças', 'Forma', 'Parcelas', 'Total do pedido', 'Valor pago', 'Status'],
    [17, 12, 24, 17, 26, 60, 8, 10, 10, 16, 14, 18],
  )
  r = 5
  for (const order of orders) {
    put(ordersWs, r, 1, order.paid_at ? excelDate(order.paid_at) : null)
    ordersWs.getCell(r, 1).numFmt = 'dd/mm/yyyy hh:mm'
    put(ordersWs, r, 2, `#${order.id.slice(0, 8).toUpperCase()}`)
    put(ordersWs, r, 3, order.customer?.name ?? null)
    put(ordersWs, r, 4, order.customer?.phone_number ?? null)
    put(ordersWs, r, 5, order.customer?.email ?? null)
    put(ordersWs, r, 6, order.items.map((i) => `${i.quantity}× ${i.description}`).join('; '))
    put(ordersWs, r, 7, pieceCount(order), { center: true })
    put(ordersWs, r, 8, order.capture_method === 'pix' ? 'Pix' : 'Cartão', { center: true })
    put(ordersWs, r, 9, order.installments ?? 1, { center: true })
    put(ordersWs, r, 10, order.total_cents / 100, { money: true })
    put(ordersWs, r, 11, order.paid_amount_cents === null ? null : order.paid_amount_cents / 100, { money: true })
    put(ordersWs, r, 12, STATUS[order.status] ?? order.status, { center: true })
    r++
  }
  const lastOrder = r - 1
  if (orders.length) ordersWs.autoFilter = `A4:L${lastOrder}`
  put(ordersWs, r, 1, 'TOTAL', { bold: true, fill: TOTAL })
  for (const c of [2, 3, 4, 5, 6, 8, 9, 12]) put(ordersWs, r, c, null, { fill: TOTAL })
  const sum = (col: string, value: number) =>
    ({ formula: orders.length ? `SUM(${col}5:${col}${lastOrder})` : '0', result: value }) as ExcelJS.CellFormulaValue
  put(ordersWs, r, 7, sum('G', orders.reduce((n, o) => n + pieceCount(o), 0)), { bold: true, center: true, fill: TOTAL })
  put(ordersWs, r, 10, sum('J', orders.reduce((n, o) => n + o.total_cents, 0) / 100), { bold: true, money: true, fill: TOTAL })
  put(ordersWs, r, 11, sum('K', orders.reduce((n, o) => n + (o.paid_amount_cents ?? 0), 0) / 100), { bold: true, money: true, fill: TOTAL })

  // ——— Como usar ———
  const help = wb.addWorksheet('Como usar')
  help.getColumn(1).width = 120
  const helpLines = [
    'COMO USAR',
    `1. Esta planilha foi exportada do painel da loja (www.blessfitstore.com.br/admin) em ${generatedAt}.`,
    '2. Aba Estoque: peças avulsas. Saldo = estoque atual no painel; Saídas = vendidas pelo site; Entradas = Saldo + Saídas.',
    '3. Aba Conjuntos: no site cada conjunto tem estoque próprio (coluna Disponível) e Vendidos = conjuntos vendidos pelo site.',
    '4. Abas Vendas e Pedidos: só pedidos pagos (pago, a conferir, enviado e entregue). Valor pago inclui juros do parcelamento, quando houver.',
    '5. Mudanças feitas aqui NÃO voltam para o site: estoque e preços se editam no painel (Estoque e Preços).',
    '6. Células amarelas = dados que você costuma preencher. Saldo e Desconto são fórmulas.',
    '',
    'Padrão do código: REFERÊNCIA DO SITE-COR-TAMANHO  (ex.: BF-M02-R-PRE-G = Regata Fôlego Preta G).',
    `Referências: ${Object.entries(PIECES)
      .map(([ref, info]) => `${ref} ${info.name ?? CATALOG.find((p) => p.ref === ref)?.name ?? info.supplier}`)
      .join(' · ')}`,
    'Cores: PRE Preto · PET Azul Petróleo · MAR Azul Marinho · AZU Azul · BRA Branco · GRA Grafite · COR Coral',
  ]
  helpLines.forEach((text, i) => {
    const cell = help.getCell(i + 1, 1)
    cell.value = text || null
    cell.font = { ...FONT, size: i === 0 ? 13 : 10, bold: i === 0 }
  })
  help.getRow(1).height = 16.8

  return Buffer.from(await wb.xlsx.writeBuffer())
}
