import Link from 'next/link'
import { listOrders } from '@/server/admin'
import { requireAdmin } from '@/server/auth'
import type { OrderStatus } from '@/server/orders'
import { SearchIcon } from '../../_components/Icons'
import { StatusBadge } from '../../_components/StatusBadge'
import s from '../../admin.module.css'
import { cents, formatDate, METHOD_LABEL, ORDER_STATUSES, shortId, STATUS_LABEL } from '../../labels'

/** “Em andamento”: o que ainda pede ação (pagos para enviar, pagamentos para conferir e enviados). */
const OPEN: OrderStatus[] = ['paid', 'review', 'shipped']

type Filter = 'abertos' | 'todos' | OrderStatus

const TABS: { id: Filter; label: string }[] = [
  { id: 'abertos', label: 'Em andamento' },
  ...ORDER_STATUSES.filter((id) => id !== 'pending').map((id) => ({ id, label: STATUS_LABEL[id] })),
  { id: 'pending', label: STATUS_LABEL.pending },
  { id: 'todos', label: 'Todos' },
]

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdmin()
  const params = await searchParams
  const filter: Filter = TABS.some((t) => t.id === params.status) ? (params.status as Filter) : 'abertos'
  const q = params.q?.trim() ?? ''

  const orders = await listOrders({
    statuses: filter === 'abertos' ? OPEN : filter === 'todos' ? undefined : [filter],
    q,
  })
  const href = (status: Filter) => `/admin/pedidos?status=${status}${q ? `&q=${encodeURIComponent(q)}` : ''}`

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>Pedidos</h1>
          <p>
            {orders.length} pedido(s) {q && <>para “{q}”</>}
          </p>
        </div>
      </div>

      <form className={s.toolbar} role="search">
        <input type="hidden" name="status" value={filter} />
        <label className={s.search}>
          <SearchIcon />
          <span className={s.srOnly}>Buscar pedidos</span>
          <input className={s.input} name="q" defaultValue={q} placeholder="Cliente, produto ou nº do pedido" />
        </label>
        <button className={`${s.button} ${s.secondary}`} type="submit">
          Buscar
        </button>
      </form>

      <nav className={s.chips} aria-label="Filtrar por status" style={{ marginBottom: 16 }}>
        {TABS.map((tab) => (
          <Link key={tab.id} href={href(tab.id)} className={s.chip} aria-current={tab.id === filter}>
            {tab.label}
          </Link>
        ))}
      </nav>

      <section className={s.card}>
        <div className={`${s.orderRow} ${s.orderHeader}`} aria-hidden="true">
          <span>Pedido</span>
          <span>Cliente</span>
          <span>Itens</span>
          <span>Pagamento</span>
          <span style={{ textAlign: 'right' }}>Total</span>
          <span>Status</span>
        </div>
        {orders.length === 0 && <p className={s.empty}>Nenhum pedido encontrado.</p>}
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/pedidos/${order.id}`} className={s.orderRow}>
            <span>
              <span className={s.orderId}>#{shortId(order.id)}</span>
              <span className={s.cellSub}>{formatDate(order.created_at)}</span>
            </span>
            <span>
              <span className={s.cellMain}>{order.customer?.name ?? 'Cliente não informado'}</span>
              <span className={s.cellSub}>{order.customer?.phone_number ?? order.customer?.email ?? ''}</span>
            </span>
            <span className={s.cellSub}>
              {order.items.map((item) => `${item.quantity}× ${item.description}`).join(', ')}
            </span>
            <span>
              {METHOD_LABEL[order.method]}
              {order.installments && order.installments > 1 ? ` ${order.installments}x` : ''}
            </span>
            <span className={s.amount}>{cents(order.total_cents)}</span>
            <StatusBadge status={order.status} />
          </Link>
        ))}
      </section>
    </>
  )
}
