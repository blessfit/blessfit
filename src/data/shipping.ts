/*
 * Frete: peso e medidas das peças, embalagens, serviços aceitos e a tabela de contingência
 * (usada quando o Melhor Envio não responde). Regras e cálculo ficam em src/server/shipping/.
 *
 * ⏳ Valores PROVISÓRIOS, estimados para a peça dobrada no saquinho. Pese e meça as peças reais e
 * troque aqui (docs/spec-frete.md §2).
 */
import type { Kind } from './catalog'

export type Region = 'Sudeste' | 'Sul' | 'Centro-Oeste' | 'Nordeste' | 'Norte'

/** Peça dobrada: peso em gramas e medidas em cm (comprimento × largura × altura). */
export const PIECE: Record<Kind, { weightG: number; lengthCm: number; widthCm: number; heightCm: number }> = {
  Blusa: { weightG: 150, lengthCm: 25, widthCm: 20, heightCm: 2 },
  Shorts: { weightG: 150, lengthCm: 25, widthCm: 20, heightCm: 2 },
  Legging: { weightG: 250, lengthCm: 25, widthCm: 20, heightCm: 3 },
  Conjunto: { weightG: 400, lengthCm: 25, widthCm: 20, heightCm: 5 },
}

export const PACKAGING = {
  /** Envelope de segurança 32 × 40 cm: até `maxPieces` peças e `maxHeightCm` de altura somada. */
  envelope: { weightG: 30, lengthCm: 30, widthCm: 25, maxPieces: 3, maxHeightCm: 8 },
  /** Acima do envelope: caixa de medida fixa. */
  box: { weightG: 150, lengthCm: 30, widthCm: 25, heightCm: 12 },
  /** Peso mínimo enviado ao Melhor Envio. */
  minWeightG: 300,
}

/** Serviços do Melhor Envio aceitos no checkout (id no ME → nome exibido). 🔎 conferir os ids no sandbox */
export const SERVICES: Record<number, { name: string; carrier: string }> = {
  1: { name: 'PAC', carrier: 'Correios' },
  2: { name: 'SEDEX', carrier: 'Correios' },
  17: { name: 'Mini Envios', carrier: 'Correios' },
}

/** Dias úteis somados ao prazo da transportadora (separar, embalar e postar). */
export const HANDLING_DAYS = 1

/** Mais opções que isso não aparecem no checkout. */
export const MAX_OPTIONS = 3

/** Se a etiqueta ficar mais cara que a cotação do cliente acima disto (centavos), o painel pede confirmação. */
export const LABEL_PRICE_TOLERANCE_CENTS = 300

/** Contingência: preço único por região (um pouco acima do real) quando o Melhor Envio falha. Usa o PAC. */
export const FALLBACK: Record<Region, { priceCents: number; days: { min: number; max: number } }> = {
  Sudeste: { priceCents: 2500, days: { min: 4, max: 8 } },
  Sul: { priceCents: 3000, days: { min: 5, max: 9 } },
  'Centro-Oeste': { priceCents: 3300, days: { min: 5, max: 10 } },
  Nordeste: { priceCents: 3800, days: { min: 7, max: 12 } },
  Norte: { priceCents: 4500, days: { min: 8, max: 15 } },
}

/** Serviço usado nas opções de contingência (a etiqueta é comprada nele). */
export const FALLBACK_SERVICE = 1
