import Link from 'next/link'
import { LOW_STOCK, listOrders, pendingCounts, restockList, salesSummary } from '@/server/admin'
import { requireAdmin } from '@/server/auth'
import { getLiveCatalog } from '@/server/supabase'
import { ExportButton } from '../_components/ExportButton'
import { AlertIcon, BoxIcon, CashIcon, TruckIcon } from '../_components/Icons'
import { StatusBadge } from '../_components/StatusBadge'
import s from '../admin.module.css'
import { cents, formatDate, greeting, shortId, today } from '../labels'
import { productPhoto } from '../photos'

/** Início: números de vendas, o que precisa de ação e o que repor. */
export default async function DashboardPage() {
  await requireAdmin()
  const [sales, pending, recent, live] = await Promise.all([
    salesSummary(),
    pendingCounts(),
    listOrders({ statuses: ['paid', 'review', 'shipped', 'delivered'], limit: 6 }),
    getLiveCatalog(),
  ])
  const restock = restockList(live)
  const ticket = sales.month.count ? sales.month.total / sales.month.count : 0

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>{greeting()}!</h1>
          <p>{today()}</p>
        </div>
        <ExportButton />
      </div>

      <div className={s.stats}>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statIcon}>
            <CashIcon />
          </span>
          <div className={s.statLabel}>Vendas hoje</div>
          <div className={s.statValue}>{cents(sales.today.total)}</div>
          <div className={s.statHint}>
            {sales.today.count} pedido(s) · 7 dias: {cents(sales.week.total)}
          </div>
        </div>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statIcon} data-tone="petrol">
            <CashIcon />
          </span>
          <div className={s.statLabel}>Últimos 30 dias</div>
          <div className={s.statValue}>{cents(sales.month.total)}</div>
          <div className={s.statHint}>
            {sales.month.count} pedido(s) · ticket médio {cents(ticket)}
          </div>
        </div>
        <Link href="/admin/pedidos?status=paid" className={`${s.card} ${s.stat}`}>
          <span className={s.statIcon} data-tone="amber">
            <TruckIcon />
          </span>
          <div className={s.statLabel}>Para enviar</div>
          <div className={s.statValue}>{pending.toShip}</div>
          <div className={s.statHint}>
            {pending.toReview ? `+ ${pending.toReview} pagamento(s) para conferir` : 'pedidos pagos aguardando envio'}
          </div>
        </Link>
        <Link href="/admin/estoque?baixo=1" className={`${s.card} ${s.stat}`}>
          <span className={s.statIcon} data-tone={restock.some((r) => r.quantity === 0) ? 'red' : 'amber'}>
            <BoxIcon />
          </span>
          <div className={s.statLabel}>Para repor</div>
          <div className={s.statValue}>{restock.length}</div>
          <div className={s.statHint}>tamanhos esgotados ou com até {LOW_STOCK} un.</div>
        </Link>
      </div>

      {pending.toReview > 0 && (
        <p className={s.alert}>
          <AlertIcon />
          <span>
            {pending.toReview} pagamento(s) com valor ou forma diferente do pedido.{' '}
            <Link href="/admin/pedidos?status=review">Conferir agora</Link>
          </span>
        </p>
      )}

      <div className={s.columns}>
        <section className={s.card}>
          <div className={s.cardHead}>
            <h2>Últimas vendas</h2>
            <Link href="/admin/pedidos">Ver todos</Link>
          </div>
          {recent.length === 0 && <p className={s.empty}>Nenhuma venda ainda. Elas aparecem aqui assim que forem pagas.</p>}
          {recent.map((order) => (
            <Link key={order.id} href={`/admin/pedidos/${order.id}`} className={s.recentRow}>
              <span>
                <span className={s.cellMain}>{order.customer?.name ?? `Pedido #${shortId(order.id)}`}</span>
                <span className={s.cellSub}>
                  {formatDate(order.created_at)} · {order.items.reduce((n, i) => n + i.quantity, 0)} peça(s)
                </span>
              </span>
              <span className={s.amount}>{cents(order.total_cents)}</span>
              <StatusBadge status={order.status} />
            </Link>
          ))}
        </section>

        <section className={s.card}>
          <div className={s.cardHead}>
            <h2>Repor estoque</h2>
            <Link href="/admin/estoque?baixo=1">Abrir estoque</Link>
          </div>
          {restock.length === 0 ? (
            <p className={s.empty}>Tudo em dia por aqui.</p>
          ) : (
            <ul className={s.restock}>
              {restock.slice(0, 8).map((item) => (
                <li key={`${item.product.id}-${item.color}-${item.size}`}>
                  <img className={`${s.thumb} ${s.thumbSm}`} src={productPhoto(item.product.id, item.color)} alt="" />
                  <Link href={`/admin/estoque#${item.product.id}`}>
                    <span className={s.cellMain}>{item.product.name}</span>
                    <span className={s.cellSub}>
                      {item.color} · {item.size}
                    </span>
                  </Link>
                  <span className={s.qty} data-level={item.quantity === 0 ? 'out' : 'low'}>
                    {item.quantity === 0 ? 'Esgotado' : `${item.quantity} un.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
