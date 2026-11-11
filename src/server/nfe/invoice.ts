/*
 * Monta a NF-e a partir do pedido (docs/spec-nfe-bling.md §8). Função pura: não chama o Bling nem o banco.
 *
 * O rascunho sai em termos do site (centavos, kg, CPF só com dígitos). Quem traduz para o formato do Bling é
 * o ./bling, para nenhum tipo da API vazar daqui.
 */
import 'server-only'
import { CATALOG } from '@/data/catalog'
import { FISCAL } from '@/data/fiscal'
import { PIECE } from '@/data/shipping'
import { digits, isCpf, normalizeCep } from '@/lib/documents'
import type { Order } from '../orders'

export type InvoiceItem = {
  /** Único por variação: o Bling recusa o mesmo código em cor ou tamanho diferente. */
  code: string
  description: string
  quantity: number
  unitCents: number
  ncm: string
  origin: number
  /** Peso de uma unidade. */
  weightKg: number
}

export type InvoiceDraft = {
  /** `AAAA-MM-DD HH:MM:SS` no horário de Brasília. */
  issuedAt: string
  natureId: number
  customer: {
    name: string
    cpf: string
    email?: string
    phone?: string
    address: { street: string; number: string; complement?: string; district: string; cep: string; city: string; uf: string }
  }
  items: InvoiceItem[]
  discountCents: number
  shippingCents: number
  carrier: string
  volume: { grossKg: number; netKg: number }
  payment: { date: string; amountCents: number; methodId: number }
}

export type InvoiceConfig = {
  environment: 'test' | 'production'
  natureId: number | null
  paymentIds: { pix: number | null; card: number | null }
}

export type InvoiceResult = { ok: true; draft: InvoiceDraft } | { ok: false; error: string }

const positiveInt = (value: string | undefined) => {
  const n = Number(value)
  return Number.isSafeInteger(n) && n > 0 ? n : null
}

/** Configuração lida das variáveis de ambiente (spec §11). */
export function invoiceConfig(environment: 'test' | 'production'): InvoiceConfig {
  return {
    environment,
    natureId: positiveInt(process.env.BLING_NATUREZA_ID),
    paymentIds: {
      pix: positiveInt(process.env.BLING_FORMA_PAGAMENTO_PIX_ID),
      card: positiveInt(process.env.BLING_FORMA_PAGAMENTO_CARTAO_ID),
    },
  }
}

/** `BF-F01`, `Azul Petróleo`, `M` → `BF-F01-AZUL-PETROLEO-M`. */
export function itemCode(ref: string, color: string, size: string): string {
  return [ref, color, size]
    .join('-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

const BRASILIA = 'America/Sao_Paulo'

/** Data e hora em Brasília: `AAAA-MM-DD HH:MM:SS`. */
export function brasiliaDateTime(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: BRASILIA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`
}

const kg = (grams: number) => Math.round(grams) / 1000

/** Telefone sem o `+55`, como o Bling espera para destinatário nacional. */
const localPhone = (phone: string | undefined) => {
  const n = digits(phone ?? '')
  const local = n.length > 11 && n.startsWith('55') ? n.slice(2) : n
  return local.length >= 10 ? local : undefined
}

const text = (value: string | undefined) => value?.trim() || undefined

/** Valida o pedido e monta a nota. Qualquer dado faltando devolve o motivo, sem chamar o Bling. */
export function buildInvoice(order: Order, config: InvoiceConfig, now: Date): InvoiceResult {
  const fail = (error: string): InvoiceResult => ({ ok: false, error })

  if (order.status !== 'paid') return fail('Só pedidos pagos (e conferidos) emitem nota')
  if (order.nfe_key) return fail('Este pedido já tem uma chave de NF-e gravada')
  if (config.environment === 'production' && !FISCAL.reviewed) {
    return fail('Os dados fiscais (NCM e origem) ainda não foram conferidos pelo contador')
  }
  if (!config.natureId) return fail('Natureza de operação do Bling não configurada (BLING_NATUREZA_ID)')
  const methodId = order.method === 'pix' ? config.paymentIds.pix : config.paymentIds.card
  if (!methodId) {
    return fail(`Forma de pagamento ${order.method === 'pix' ? 'Pix' : 'cartão'} do Bling não configurada`)
  }

  const cpf = digits(order.customer_cpf ?? '')
  if (!isCpf(cpf)) return fail('Pedido sem CPF válido do cliente')
  const name = text(order.customer?.name)
  if (!name) return fail('Pedido sem o nome do cliente')

  const address = order.shipping_address
  const cep = normalizeCep(address?.cep ?? '')
  if (!address || !cep || !text(address.street) || !text(address.district) || !text(address.city) || !/^[A-Z]{2}$/.test(address.uf ?? '')) {
    return fail('Endereço de entrega incompleto (rua, bairro, cidade, UF e CEP)')
  }
  if (!order.shipping) return fail('Pedido sem a opção de frete')

  if (!order.items.length) return fail('Pedido sem itens')
  const items: InvoiceItem[] = []
  let netGrams = 0
  for (const item of order.items) {
    const product = CATALOG.find((p) => p.id === item.id)
    if (!product) return fail(`Produto fora do catálogo: ${item.description}`)
    const ncm = FISCAL.ncm[product.kind]
    if (!ncm) return fail(`Sem NCM para ${product.kind}`)
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isInteger(item.price) || item.price < 1) {
      return fail(`Quantidade ou preço inválido em ${item.description}`)
    }
    const weightG = PIECE[product.kind].weightG
    netGrams += weightG * item.quantity
    items.push({
      code: itemCode(item.ref, item.color, item.size),
      description: item.description,
      quantity: item.quantity,
      unitCents: item.price,
      ncm,
      origin: FISCAL.origin,
      weightKg: kg(weightG),
    })
  }

  const itemsCents = items.reduce((sum, item) => sum + item.unitCents * item.quantity, 0)
  if (itemsCents !== order.items_total_cents) return fail('A soma dos itens não bate com o subtotal do pedido')
  const discountCents = order.discount_cents ?? 0
  const shippingCents = order.shipping_cents ?? 0
  if (discountCents < 0 || discountCents >= itemsCents || shippingCents < 0) return fail('Desconto ou frete inválido no pedido')
  if (itemsCents - discountCents + shippingCents !== order.total_cents) {
    return fail('Itens, desconto e frete não fecham com o total do pedido')
  }
  if (order.paid_amount_cents !== null && order.paid_amount_cents !== order.total_cents) {
    return fail('O valor pago é diferente do total do pedido: confira antes de emitir')
  }

  return {
    ok: true,
    draft: {
      issuedAt: brasiliaDateTime(now),
      natureId: config.natureId,
      customer: {
        name,
        cpf,
        email: text(order.customer?.email),
        phone: localPhone(order.customer?.phone_number),
        address: {
          street: address.street.trim(),
          number: text(address.number) ?? 'S/N',
          complement: text(address.complement),
          district: address.district.trim(),
          cep,
          city: address.city.trim(),
          uf: address.uf,
        },
      },
      items,
      discountCents,
      shippingCents,
      carrier: order.shipping.carrier || order.shipping.name,
      volume: { grossKg: kg(Math.max(order.shipping.parcel?.weightG ?? 0, netGrams)), netKg: kg(netGrams) },
      payment: {
        // à vista: vence no dia da emissão. A Sefaz rejeita vencimento anterior à emissão (pedido pago dias antes)
        date: brasiliaDateTime(now).slice(0, 10),
        amountCents: order.total_cents,
        methodId,
      },
    },
  }
}
