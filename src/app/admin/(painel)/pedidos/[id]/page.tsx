import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SHOP } from '@/data/shop'
import { getOrderWithEvents } from '@/server/admin'
import { requireAdmin } from '@/server/auth'
import { walletBalance } from '@/server/shipping/label'
import { updateOrderStatus } from '../../../actions'
import { AlertIcon, ArrowLeftIcon, WhatsAppIcon } from '../../../_components/Icons'
import { SubmitButton } from '../../../_components/Pending'
import { ShippingCard } from '../../../_components/ShippingCard'
import { StatusBadge } from '../../../_components/StatusBadge'
import s from '../../../admin.module.css'
import { cents, formatDate, METHOD_LABEL, NEXT_STEP, ORDER_STATUSES, shortId, STATUS_LABEL } from '../../../labels'
import { productPhoto } from '../../../photos'

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const found = await getOrderWithEvents((await params).id)
  if (!found) notFound()
  const { order, events } = found

  const phone = order.customer?.phone_number?.replace(/\D/g, '')
  const firstName = order.customer?.name?.split(' ')[0]
  const whatsapp = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        `Olá${firstName ? `, ${firstName}` : ''}! Aqui é da ${SHOP.name}, sobre o seu pedido #${shortId(order.id)}.`,
      )}`
    : null
  const next = NEXT_STEP[order.status]
  const pieces = order.items.reduce((n, item) => n + item.quantity, 0)
  // saldo do ME só interessa enquanto a etiqueta não foi gerada
  const balance = order.status === 'paid' && order.shipping && order.shipping_status !== 'ready' ? await walletBalance() : null

  return (
    <>
      <Link href="/admin/pedidos" className={s.back}>
        <ArrowLeftIcon /> Pedidos
      </Link>
      <div className={s.pageHead}>
        <div>
          <h1>
            Pedido #{shortId(order.id)} <StatusBadge status={order.status} />
          </h1>
          <p>Criado em {formatDate(order.created_at)}</p>
        </div>
        {next && (
          <form action={updateOrderStatus}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="status" value={next.status} />
            <SubmitButton pendingLabel="Salvando…">{next.label}</SubmitButton>
          </form>
        )}
      </div>

      {order.status === 'review' && (
        <p className={s.alert}>
          <AlertIcon />
          <span>
            Pago {order.paid_amount_cents !== null ? cents(order.paid_amount_cents) : ''} via{' '}
            {order.capture_method === 'pix' ? 'Pix' : 'cartão'}, mas o pedido era de {cents(order.total_cents)} no{' '}
            {METHOD_LABEL[order.method]}. Confira antes de enviar.
          </span>
        </p>
      )}

      <div className={s.columns}>
        <div className={s.stack}>
          <section className={s.card}>
            <div className={s.cardHead}>
              <h2>Itens ({pieces})</h2>
            </div>
            <ul className={s.items}>
              {order.items.map((item) => (
                <li key={`${item.id}-${item.color}-${item.size}`} className={s.item}>
                  <img className={s.thumb} src={productPhoto(item.id, item.color)} alt="" />
                  <span>
                    <span className={s.cellMain}>{item.description}</span>
                    <span className={s.cellSub}>
                      Ref. {item.ref} · {item.quantity} × {cents(item.price)}
                    </span>
                  </span>
                  <span className={s.amount}>{cents(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className={s.totals}>
              <div>
                <span>Itens</span>
                <span>{cents(order.items_total_cents)}</span>
              </div>
              <div>
                <span>Frete{order.shipping ? ` (${order.shipping.carrier} ${order.shipping.name})` : ''}</span>
                <span>{order.shipping_cents === 0 ? 'Grátis' : cents(order.shipping_cents)}</span>
              </div>
              <div>
                <span>Forma escolhida</span>
                <span>{METHOD_LABEL[order.method]}</span>
              </div>
              {order.paid_amount_cents !== null && (
                <div>
                  <span>
                    Valor pago ({order.capture_method === 'pix' ? 'Pix' : 'cartão'}
                    {order.installments && order.installments > 1 ? ` em ${order.installments}x` : ''})
                  </span>
                  <span>{cents(order.paid_amount_cents)}</span>
                </div>
              )}
              <div className={s.grand}>
                <span>Total do pedido</span>
                <span>{cents(order.total_cents)}</span>
              </div>
            </div>
          </section>

          <section className={s.card}>
            <div className={s.cardHead}>
              <h2>Pagamento</h2>
              {order.receipt_url && (
                <a href={order.receipt_url} target="_blank" rel="noopener noreferrer">
                  Ver comprovante
                </a>
              )}
            </div>
            <dl className={`${s.cardBody} ${s.facts}`}>
              <div>
                <dt>Pago em</dt>
                <dd>{order.paid_at ? formatDate(order.paid_at) : 'Ainda não pago'}</dd>
              </div>
              {order.transaction_nsu && (
                <div>
                  <dt>Transação InfinitePay</dt>
                  <dd>{order.transaction_nsu}</dd>
                </div>
              )}
              <div>
                <dt>Nº completo do pedido</dt>
                <dd>{order.id}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className={s.stack}>
          <section className={s.card}>
            <div className={s.cardHead}>
              <h2>Cliente</h2>
            </div>
            <div className={`${s.cardBody} ${s.actions}`}>
              {order.customer ? (
                <dl className={s.facts}>
                  {order.customer.name && (
                    <div>
                      <dt>Nome</dt>
                      <dd>{order.customer.name}</dd>
                    </div>
                  )}
                  {order.customer.phone_number && (
                    <div>
                      <dt>Telefone</dt>
                      <dd>{order.customer.phone_number}</dd>
                    </div>
                  )}
                  {order.customer_cpf && (
                    <div>
                      <dt>CPF</dt>
                      <dd>{order.customer_cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</dd>
                    </div>
                  )}
                  {order.customer.email && (
                    <div>
                      <dt>E-mail</dt>
                      <dd>{order.customer.email}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className={s.cellSub}>O cliente preencheu os dados direto no checkout da InfinitePay.</p>
              )}
              {whatsapp && (
                <a className={`${s.button} ${s.whatsapp}`} href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon /> Chamar no WhatsApp
                </a>
              )}
            </div>
          </section>

          <ShippingCard order={order} balanceCents={balance} />

          <section className={s.card}>
            <div className={s.cardHead}>
              <h2>Andamento</h2>
            </div>
            <div className={`${s.cardBody} ${s.actions}`}>
              <ol className={s.timeline}>
                {events.map((event, i) => (
                  <li key={i}>
                    <strong>{STATUS_LABEL[event.status] ?? event.status}</strong>
                    <span>{formatDate(event.created_at)}</span>
                  </li>
                ))}
              </ol>
              {/* key: o select volta para o status atual depois de cada mudança */}
              <form key={order.status} action={updateOrderStatus} className={s.inline}>
                <input type="hidden" name="id" value={order.id} />
                <label className={s.srOnly} htmlFor="status">
                  Mudar status
                </label>
                <select id="status" className={s.select} name="status" defaultValue={order.status}>
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
                <SubmitButton className={`${s.button} ${s.secondary}`}>Mudar</SubmitButton>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
