'use client'

/*
 * /conta/pedidos — pedidos do cliente logado (feitos logado ou como convidado com o mesmo e-mail).
 */
import { Button } from '@/components/ui'
import { formatBRL } from '@/lib/price'
import type { CustomerOrder } from '@/server/customers'
import * as S from './Account.styles'
import { AccountShell } from './AccountShell'

const STATUS: Record<string, { label: string; tone: 'ok' | 'wait' | 'off' }> = {
  pending: { label: 'Aguardando pagamento', tone: 'wait' },
  review: { label: 'Em análise', tone: 'wait' },
  paid: { label: 'Pago', tone: 'ok' },
  shipped: { label: 'Enviado', tone: 'ok' },
  delivered: { label: 'Entregue', tone: 'ok' },
  canceled: { label: 'Cancelado', tone: 'off' },
}

// fuso fixo: a data sai igual no servidor (UTC) e no navegador
const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })

export function OrdersView({ name, email, orders }: { name: string; email: string; orders: CustomerOrder[] }) {
  return (
    <AccountShell active="/conta/pedidos" name={name} email={email}>
      <S.Card aria-labelledby="pedidos-titulo">
        <S.Subtitle id="pedidos-titulo">Meus pedidos</S.Subtitle>
        {orders.length === 0 ? (
          <>
            <S.Lead>Você ainda não tem pedidos.</S.Lead>
            <div style={{ marginTop: 20 }}>
              <Button variant="primary" href="/#conjuntos">
                Ver produtos
              </Button>
            </div>
          </>
        ) : (
          <S.Orders>
            {orders.map((order) => {
              const status = STATUS[order.status] ?? { label: order.status, tone: 'wait' as const }
              const pieces = order.items.reduce((n, item) => n + item.quantity, 0)
              return (
                <li key={order.id}>
                  <a href={`/pedido/${order.id}`}>
                    <strong>Pedido #{order.id.slice(0, 8).toUpperCase()}</strong>
                    <S.Status $tone={status.tone}>{status.label}</S.Status>
                    <span>
                      {date.format(new Date(order.created_at))} · {pieces === 1 ? '1 peça' : `${pieces} peças`}
                    </span>
                    <span style={{ justifySelf: 'end' }}>{formatBRL(order.total_cents / 100)}</span>
                  </a>
                </li>
              )
            })}
          </S.Orders>
        )}
      </S.Card>
    </AccountShell>
  )
}
