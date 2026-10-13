import Link from 'next/link'
import { requireAdmin } from '@/server/auth'
import type { Order, OrderStatus } from '@/server/orders'
import { db } from '@/server/supabase'
import { updateOrderStatus } from '../actions'
import s from '../admin.module.css'
import { cents, formatDate, METHOD_LABEL, ORDER_STATUSES, STATUS_LABEL } from '../labels'

/** “Em andamento”: o que ainda pede ação (pagos para enviar e pagamentos para conferir). */
const OPEN: OrderStatus[] = ['paid', 'review', 'shipped']

type Filter = 'abertos' | 'todos' | OrderStatus

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin()
  const param = (await searchParams).status
  const filter: Filter = param === 'todos' || ORDER_STATUSES.includes(param as OrderStatus) ? (param as Filter) : 'abertos'

  let query = db().from('orders').select('*').order('created_at', { ascending: false }).limit(200)
  if (filter === 'abertos') query = query.in('status', OPEN)
  else if (filter !== 'todos') query = query.eq('status', filter)
  const { data, error } = await query.returns<Order[]>()
  if (error) throw error

  const tabs: { id: Filter; label: string }[] = [
    { id: 'abertos', label: 'Em andamento' },
    ...ORDER_STATUSES.map((id) => ({ id, label: STATUS_LABEL[id] })),
    { id: 'todos', label: 'Todos' },
  ]

  return (
    <>
      <h1 className={s.title}>Pedidos</h1>
      <nav className={s.filters} aria-label="Filtrar pedidos">
        {tabs.map((tab) => (
          <Link key={tab.id} href={`/admin?status=${tab.id}`} aria-current={tab.id === filter}>
            {tab.label}
          </Link>
        ))}
      </nav>

      {data.length === 0 && <p className={s.muted}>Nenhum pedido aqui.</p>}

      <div className={s.orders}>
        {data.map((order) => (
          <article key={order.id} className={s.order}>
            <div className={s.orderHead}>
              <strong>{cents(order.total_cents)}</strong>
              <span className={s.badge} data-status={order.status}>
                {STATUS_LABEL[order.status]}
              </span>
              <span>
                {METHOD_LABEL[order.method]}
                {order.installments && order.installments > 1 ? ` em ${order.installments}x` : ''}
              </span>
              <span className={s.muted}>{formatDate(order.created_at)}</span>
              <span className={s.muted}>#{order.id.slice(0, 8)}</span>
            </div>

            <details>
              <summary>
                {order.items.reduce((n, item) => n + item.quantity, 0)} peça(s)
                {order.customer?.name ? ` · ${order.customer.name}` : ''}
              </summary>
              <ul>
                {order.items.map((item) => (
                  <li key={`${item.id}-${item.color}-${item.size}`}>
                    {item.quantity}× {item.description} (Ref. {item.ref}) · {cents(item.price * item.quantity)}
                  </li>
                ))}
              </ul>
              {order.customer && (
                <p className={s.muted}>
                  {[order.customer.name, order.customer.email, order.customer.phone_number].filter(Boolean).join(' · ')}
                </p>
              )}
              {order.status === 'review' && (
                <p className={s.alert}>
                  Pago {order.paid_amount_cents !== null ? cents(order.paid_amount_cents) : ''} via{' '}
                  {order.capture_method === 'pix' ? 'Pix' : 'cartão'}, diferente do pedido ({cents(order.total_cents)} no{' '}
                  {METHOD_LABEL[order.method]}). Confira antes de enviar.
                </p>
              )}
              {order.receipt_url && (
                <p>
                  <a href={order.receipt_url} target="_blank" rel="noopener noreferrer">
                    Ver comprovante
                  </a>
                </p>
              )}
            </details>

            <form action={updateOrderStatus} className={s.statusForm}>
              <input type="hidden" name="id" value={order.id} />
              <select className={s.select} name="status" defaultValue={order.status} aria-label="Status do pedido">
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
              <button className={s.button} type="submit">
                Salvar status
              </button>
            </form>
          </article>
        ))}
      </div>
    </>
  )
}
