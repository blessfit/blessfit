/*
 * Etiqueta do pedido no Melhor Envio, gerada pelo painel depois de emitir a NF-e:
 * carrinho → pagar com o saldo → gerar → imprimir.
 *
 * Cada passo grava o resultado antes do próximo. Se algo falhar, gerar de novo retoma de onde parou
 * (com `me_order_id` gravado, não cria outro carrinho nem paga duas vezes).
 */
import 'server-only'
import { LABEL_PRICE_TOLERANCE_CENTS } from '@/data/shipping'
import { isNfeKey, digits } from '@/lib/documents'
import { findOrder, type Order } from '../orders'
import { db } from '../supabase'
import * as melhorEnvio from './melhor-envio'
import { originCep } from './quote'

export type LabelResult =
  | { ok: true }
  | { ok: false; error: string }
  /** A etiqueta ficou mais cara que a cotação do cliente: gerar de novo com `acceptCents` para seguir. */
  | { ok: false; error: string; confirm: { quotedCents: number; currentCents: number } }

/** Remetente: dados do CNPJ da loja, nas env vars SHIPPING_SENDER_*. */
function sender(): melhorEnvio.Address {
  const env = (key: string) => process.env[`SHIPPING_SENDER_${key}`]?.trim()
  const required = { name: env('NAME'), companyDocument: env('CNPJ'), phone: env('PHONE'), email: env('EMAIL'), street: env('STREET'), number: env('NUMBER'), district: env('DISTRICT'), city: env('CITY'), uf: env('UF') }
  const missing = Object.entries(required).filter(([, value]) => !value).map(([key]) => key)
  if (missing.length) throw new Error(`Dados do remetente faltando nas env vars SHIPPING_SENDER_*: ${missing.join(', ')}`)
  return { ...(required as Record<keyof typeof required, string>), stateRegister: env('IE'), complement: env('COMPLEMENT'), cep: originCep() }
}

function recipient(order: Order): melhorEnvio.Address {
  const address = order.shipping_address!
  return {
    name: order.customer?.name ?? '',
    phone: digits(order.customer?.phone_number ?? ''),
    email: order.customer?.email,
    document: order.customer_cpf ?? undefined,
    ...address,
  }
}

const message = (err: unknown) => (err instanceof Error ? err.message : String(err))

async function update(id: string, patch: Partial<Order>) {
  const { error } = await db().from('orders').update(patch).eq('id', id)
  if (error) throw error
}

export async function generateLabel(orderId: string, nfeKey: string, acceptCents?: number): Promise<LabelResult> {
  const order = await findOrder(orderId)
  if (!order) return { ok: false, error: 'Pedido não encontrado' }
  if (order.status !== 'paid') return { ok: false, error: 'Só pedidos pagos (e conferidos) geram etiqueta' }
  if (!order.shipping || !order.shipping_address || !order.customer_cpf) {
    return { ok: false, error: 'Pedido sem frete ou endereço (foi feito antes do frete no site): gere a etiqueta pelo painel do Melhor Envio' }
  }
  const key = digits(nfeKey)
  if (!isNfeKey(key)) return { ok: false, error: 'Chave da NF-e inválida: confira os 44 dígitos' }

  // trava: dois cliques (ou duas abas) não compram duas etiquetas
  const { data: locked, error } = await db()
    .from('orders')
    .update({ shipping_status: 'buying', nfe_key: key, shipping_error: null })
    .eq('id', order.id)
    .or('shipping_status.is.null,shipping_status.eq.failed')
    .select('id')
  if (error) throw error
  if (!locked?.length) return { ok: false, error: 'A etiqueta já está sendo gerada ou já está pronta' }

  try {
    let meId = order.me_order_id
    if (!meId) {
      const [current] = await melhorEnvio.quote({
        from: originCep(),
        to: order.shipping_address.cep,
        parcel: order.shipping.parcel,
        services: [order.shipping.serviceId],
      })
      if (!current) throw new Error(`${order.shipping.carrier} ${order.shipping.name} não atende mais este CEP: fale com o cliente`)
      if (current.costCents > order.shipping.costCents + LABEL_PRICE_TOLERANCE_CENTS && acceptCents !== current.costCents) {
        await update(order.id, { shipping_status: order.shipping_status === 'failed' ? 'failed' : null })
        return {
          ok: false,
          error: 'A etiqueta ficou mais cara que o frete cotado para o cliente',
          confirm: { quotedCents: order.shipping.costCents, currentCents: current.costCents },
        }
      }

      meId = await melhorEnvio.addToCart({
        serviceId: order.shipping.serviceId,
        from: sender(),
        to: recipient(order),
        parcel: order.shipping.parcel,
        products: order.items.map((item) => ({ name: item.description, quantity: item.quantity, unitCents: item.price })),
        nfeKey: key,
        orderId: order.id,
      })
      await update(order.id, { me_order_id: meId })
    }

    let me = await melhorEnvio.getOrder(meId)
    if (!me.paidAt) {
      await melhorEnvio.checkout(meId)
      me = await melhorEnvio.getOrder(meId)
    }
    if (!me.generatedAt) {
      await melhorEnvio.generate(meId)
      me = await melhorEnvio.getOrder(meId)
    }

    await update(order.id, { shipping_status: 'ready', label_cost_cents: me.costCents, tracking_code: me.tracking })
    return { ok: true }
  } catch (err) {
    console.error(`[etiqueta] pedido ${order.id}`, message(err))
    await update(order.id, { shipping_status: 'failed', shipping_error: message(err).slice(0, 500) })
    return { ok: false, error: message(err) }
  }
}

/** URL do PDF da etiqueta. Aproveita para buscar o rastreio, que às vezes chega depois de gerar. */
export async function labelUrl(orderId: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const order = await findOrder(orderId)
  if (!order?.me_order_id || order.shipping_status !== 'ready') return { ok: false, error: 'Este pedido não tem etiqueta pronta' }
  try {
    if (!order.tracking_code) {
      const me = await melhorEnvio.getOrder(order.me_order_id)
      if (me.tracking) await update(order.id, { tracking_code: me.tracking })
    }
    return { ok: true, url: await melhorEnvio.printUrl(order.me_order_id) }
  } catch (err) {
    return { ok: false, error: message(err) }
  }
}

/** Cancela a etiqueta antes da postagem (o valor volta ao saldo do ME). O estorno do cliente é manual. */
export async function cancelLabel(orderId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await findOrder(orderId)
  if (!order?.me_order_id) return { ok: false, error: 'Este pedido não tem etiqueta no Melhor Envio' }
  if (order.status !== 'paid') return { ok: false, error: 'Só dá para cancelar a etiqueta antes de marcar como enviado' }
  try {
    const me = await melhorEnvio.getOrder(order.me_order_id)
    if (me.paidAt) await melhorEnvio.cancel(order.me_order_id, `Pedido ${order.id.slice(0, 8)} cancelado pela loja`)
    await update(order.id, { me_order_id: null, shipping_status: null, shipping_error: null, tracking_code: null, label_cost_cents: null })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: message(err) }
  }
}

/** Saldo da carteira do ME em centavos, ou null se não deu para consultar. */
export async function walletBalance(): Promise<number | null> {
  try {
    return await melhorEnvio.balance()
  } catch {
    return null
  }
}
