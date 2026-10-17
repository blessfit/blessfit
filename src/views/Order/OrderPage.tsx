'use client'

/*
 * Volta do pagamento (/pedido/<id>): a InfinitePay manda o cliente para cá com transaction_nsu e slug.
 * A página repassa esses parâmetros para /api/order, que confirma o pagamento na hora.
 */
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { SHOP } from '@/data/shop'
import { formatBRL } from '@/lib/price'
import { useStore } from '@/store/storeContext'
import { CheckoutShell } from '@/views/Cart'
import * as S from '../Cart/Cart.styles'

type OrderView = {
  id: string
  status: 'pending' | 'paid' | 'review' | 'shipped' | 'delivered' | 'canceled'
  method: 'card' | 'pix'
  total: number
  shipping: number
  items: { description: string; quantity: number }[]
  trackingCode: string | null
  checkoutUrl: string | null
}

/** Enquanto aguarda, consulta a cada 3 s por até 30 min (o webhook da InfinitePay grava o pagamento no banco). */
const POLL_MS = 3000
const POLL_MAX = 600

const TITLE: Record<OrderView['status'], string> = {
  pending: 'Aguardando o pagamento',
  paid: 'Pedido confirmado!',
  review: 'Pedido recebido!',
  shipped: 'Pedido enviado!',
  delivered: 'Pedido entregue',
  canceled: 'Pedido cancelado',
}

const TEXT: Record<OrderView['status'], string> = {
  pending: 'Conclua o pagamento na aba da InfinitePay. Assim que ele for aprovado, esta página atualiza sozinha (no Pix leva poucos segundos).',
  paid: 'Recebemos o seu pagamento. Vamos separar e embalar as peças, e você recebe o código de rastreio quando o pedido for postado.',
  review: 'Recebemos o pagamento e estamos conferindo. Se precisar, falamos com você pelo WhatsApp.',
  shipped: 'Seu pedido já está a caminho.',
  delivered: 'Esperamos que você ame as suas peças!',
  canceled: 'Este pedido foi cancelado. Se foi engano, fale com a gente no WhatsApp.',
}

export function OrderPage({ id }: { id: string }) {
  const { checkoutLines, removeFromBag } = useStore()
  const [order, setOrder] = useState<OrderView | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const load = async (attempt: number) => {
      try {
        const params = new URLSearchParams(window.location.search)
        params.set('id', id)
        const r = await fetch(`/api/order?${params}`)
        const data = (await r.json()) as OrderView & { error?: string }
        if (!r.ok) throw new Error(data.error ?? 'Pedido não encontrado')
        setOrder(data)
        if (data.status === 'pending' && attempt < POLL_MAX) timer = setTimeout(() => load(attempt + 1), POLL_MS)
      } catch (err) {
        setError((err as Error).message)
      }
    }
    load(0)
    return () => clearTimeout(timer)
  }, [id])

  // pedido pago: tira da sacola os itens que foram comprados
  const paid = order && order.status !== 'pending' && order.status !== 'canceled'
  useEffect(() => {
    if (paid) checkoutLines.forEach(removeFromBag)
  }, [paid, checkoutLines, removeFromBag])

  return (
    <CheckoutShell>
      <S.Empty>
        {error ? (
          <>
            <h1>Não encontramos o pedido</h1>
            <p>{error}</p>
          </>
        ) : !order ? (
          <p>Carregando o pedido…</p>
        ) : (
          <>
            <h1>{TITLE[order.status]}</h1>
            <p>
              Pedido <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> · {formatBRL(order.total)}
              {order.shipping > 0 ? ` (frete ${formatBRL(order.shipping)})` : ' · frete grátis'}
            </p>
            <p role="status" aria-live="polite">
              {TEXT[order.status]}
            </p>
            {order.status === 'pending' && (
              <p>
                Na página da InfinitePay, escolha{' '}
                {order.method === 'pix' ? (
                  <>
                    <strong>Pix</strong> para manter o preço de <strong>{formatBRL(order.total)}</strong>.
                  </>
                ) : (
                  <>
                    <strong>cartão de crédito</strong> (em até {SHOP.installments}x sem juros).
                  </>
                )}
              </p>
            )}
            {order.status === 'pending' && order.checkoutUrl && (
              <Button variant="outline" href={order.checkoutUrl} target="_blank" rel="noopener noreferrer">
                Abrir o pagamento de novo
              </Button>
            )}
            <ul>
              {order.items.map((item) => (
                <li key={item.description}>
                  {item.quantity}× {item.description}
                </li>
              ))}
            </ul>
            {order.trackingCode && (
              <p>
                Rastreio: <strong>{order.trackingCode}</strong>
              </p>
            )}
          </>
        )}
        <Button variant="primary" href="/">
          Voltar para a loja
        </Button>
      </S.Empty>
    </CheckoutShell>
  )
}
