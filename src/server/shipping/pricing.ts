/*
 * Regras de preço do frete: prazo de manuseio, frete grátis e corte nas opções exibidas.
 * Dinheiro sempre em centavos inteiros.
 */
import 'server-only'
import { HANDLING_DAYS, MAX_OPTIONS } from '@/data/shipping'
import { SHOP } from '@/data/shop'

/** Opção como veio do provedor (ou da contingência): custo da etiqueta e prazo da transportadora. */
export type RawOption = { serviceId: number; name: string; carrier: string; costCents: number; days: { min: number; max: number } }

/** Opção exibida ao cliente. `priceCents` é o que ele paga; `costCents` o que a etiqueta custa. */
export type ShippingOption = RawOption & { priceCents: number; free: boolean; cheapest: boolean; fastest: boolean }

const byPrice = (a: ShippingOption, b: ShippingOption) => a.priceCents - b.priceCents || a.days.max - b.days.max
const bySpeed = (a: ShippingOption, b: ShippingOption) => a.days.max - b.days.max || a.priceCents - b.priceCents

/**
 * `itemsCents`: valor dos itens no preço do cartão (o frete grátis não muda com a forma de pagamento).
 * Devolve no máximo MAX_OPTIONS opções, da mais barata para a mais cara.
 */
export function applyRules(raw: RawOption[], itemsCents: number): ShippingOption[] {
  if (raw.length === 0) return []
  const options = raw
    .map<ShippingOption>((o) => ({
      ...o,
      days: { min: o.days.min + HANDLING_DAYS, max: o.days.max + HANDLING_DAYS },
      priceCents: o.costCents,
      free: false,
      cheapest: false,
      fastest: false,
    }))
    .sort(byPrice)

  // frete grátis: só a opção mais barata
  if (itemsCents >= SHOP.freeShippingFrom * 100) {
    options[0] = { ...options[0], priceCents: 0, free: true }
  }

  const cheapest = options[0]
  const fastest = [...options].sort(bySpeed)[0]
  const shown = [cheapest, ...(fastest === cheapest ? [] : [fastest])]
  for (const option of options) {
    if (shown.length >= MAX_OPTIONS) break
    if (!shown.includes(option)) shown.push(option)
  }

  return shown
    .map((o) => ({ ...o, cheapest: o === cheapest, fastest: o === fastest }))
    .sort(byPrice)
}
