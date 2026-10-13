import type { OrderStatus, PayMethod } from '@/server/orders'

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'review', 'shipped', 'delivered', 'canceled']

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Aguardando pagamento',
  paid: 'Pago',
  review: 'Conferir pagamento',
  shipped: 'Enviado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
}

/** Próximo passo natural de cada status (botão principal no detalhe do pedido). */
export const NEXT_STEP: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  review: { status: 'paid', label: 'Pagamento conferido' },
  paid: { status: 'shipped', label: 'Marcar como enviado' },
  shipped: { status: 'delivered', label: 'Marcar como entregue' },
}

export const METHOD_LABEL: Record<PayMethod, string> = { card: 'Cartão', pix: 'Pix' }

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const cents = (value: number) => brl.format(value / 100)

const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })
export const formatDate = (iso: string) => date.format(new Date(iso))

const long = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' })
export const today = () => long.format(new Date())

export const shortId = (id: string) => id.slice(0, 8).toUpperCase()

/** Saudação pela hora de São Paulo. */
export function greeting(): string {
  const hour = Number(new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Sao_Paulo' }).format(new Date()))
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
}
