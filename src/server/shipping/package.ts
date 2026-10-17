/*
 * Monta o pacote do pedido (peso, medidas e valor declarado) a partir das peças, com os valores de
 * src/data/shipping.ts.
 */
import 'server-only'
import type { Kind } from '@/data/catalog'
import { PACKAGING, PIECE } from '@/data/shipping'

export type Parcel = { weightG: number; lengthCm: number; widthCm: number; heightCm: number; insuranceCents: number }

/** Uma peça (ou várias iguais) do pedido: tipo, quantidade e preço unitário em centavos. */
export type ParcelItem = { kind: Kind; quantity: number; price: number }

export function buildParcel(items: ParcelItem[]): Parcel {
  const pieces = items.reduce((n, item) => n + item.quantity, 0)
  const weightG = items.reduce((sum, item) => sum + PIECE[item.kind].weightG * item.quantity, 0)
  const heightCm = items.reduce((sum, item) => sum + PIECE[item.kind].heightCm * item.quantity, 0)
  const insuranceCents = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const { envelope, box, minWeightG } = PACKAGING
  const fitsEnvelope = pieces <= envelope.maxPieces && heightCm <= envelope.maxHeightCm
  const pack = fitsEnvelope
    ? { weightG: envelope.weightG, lengthCm: envelope.lengthCm, widthCm: envelope.widthCm, heightCm }
    : box

  return {
    weightG: Math.max(minWeightG, weightG + pack.weightG),
    lengthCm: pack.lengthCm,
    widthCm: pack.widthCm,
    heightCm: pack.heightCm,
    insuranceCents,
  }
}
