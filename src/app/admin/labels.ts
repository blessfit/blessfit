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

export const METHOD_LABEL: Record<PayMethod, string> = { card: 'Cartão', pix: 'Pix' }

/** Abaixo disto (e acima de zero) o estoque aparece como “baixo” no painel. */
export const LOW_STOCK = 2

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const cents = (value: number) => brl.format(value / 100)

const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })
export const formatDate = (iso: string) => date.format(new Date(iso))
