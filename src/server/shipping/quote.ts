/*
 * Cotação de frete do checkout: Melhor Envio com timeout curto e, se falhar, a tabela de contingência.
 */
import 'server-only'
import { CATALOG } from '@/data/catalog'
import { FALLBACK, FALLBACK_SERVICE, SERVICES } from '@/data/shipping'
import { regionOf } from '@/lib/documents'
import type { OrderItem } from '../orders'
import * as melhorEnvio from './melhor-envio'
import { buildParcel, type Parcel } from './package'
import { applyRules, type RawOption, type ShippingOption } from './pricing'

const QUOTE_TIMEOUT_MS = 3000

export type Quote = { options: ShippingOption[]; source: 'live' | 'fallback'; parcel: Parcel }

/** CEP de onde sai o pacote. */
export function originCep(): string {
  const cep = process.env.SHIPPING_ORIGIN_CEP?.replace(/\D/g, '')
  if (!cep || cep.length !== 8) throw new Error('SHIPPING_ORIGIN_CEP não configurado')
  return cep
}

/** Pacote dos itens do pedido (o tipo de cada peça vem do catálogo). */
export function parcelOf(items: OrderItem[]): Parcel {
  return buildParcel(
    items.map((item) => {
      const kind = CATALOG.find((p) => p.id === item.id)?.kind ?? 'Conjunto'
      return { kind, quantity: item.quantity, price: item.price }
    }),
  )
}

/** Opção como o site recebe: preço em reais e `id` = serviço no ME (volta no checkout). */
export const publicOption = (o: ShippingOption) => ({
  id: o.serviceId,
  name: o.name,
  carrier: o.carrier,
  price: o.priceCents / 100,
  days: o.days,
  free: o.free,
  cheapest: o.cheapest,
  fastest: o.fastest,
})

function fallback(cep: string): RawOption[] {
  const { priceCents, days } = FALLBACK[regionOf(cep)]
  const service = SERVICES[FALLBACK_SERVICE]
  return [{ serviceId: FALLBACK_SERVICE, name: service.name, carrier: service.carrier, costCents: priceCents, days }]
}

/**
 * `items`: itens com o preço do cartão (valor declarado e frete grátis não mudam com a forma de pagamento).
 * `cep` já normalizado (8 dígitos).
 */
export async function quoteShipping(cep: string, items: OrderItem[]): Promise<Quote> {
  const parcel = parcelOf(items)
  const itemsCents = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  let raw: RawOption[] = []
  try {
    raw = await melhorEnvio.quote({
      from: originCep(),
      to: cep,
      parcel,
      services: Object.keys(SERVICES).map(Number),
      timeoutMs: QUOTE_TIMEOUT_MS,
    })
    // nomes da loja (o ME às vezes devolve "PAC" ou ".Package" com outra grafia)
    raw = raw.flatMap((o) => (SERVICES[o.serviceId] ? [{ ...o, ...SERVICES[o.serviceId] }] : []))
  } catch (err) {
    console.error(`[frete] cotação do Melhor Envio falhou para ${cep.slice(0, 5)}***`, err instanceof Error ? err.message : err)
  }

  if (raw.length > 0) return { options: applyRules(raw, itemsCents), source: 'live', parcel }
  return { options: applyRules(fallback(cep), itemsCents), source: 'fallback', parcel }
}
