import { SHOP } from '@/data/shop'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatBRL = (value: number): string => brl.format(value)

export const installment = (price: number): number => Math.floor((price / SHOP.installments) * 100) / 100

/** Percentual de desconto entre o preço “de” e o “por”. */
export const discountPercent = (price: number, compareAt?: number): number =>
  compareAt && compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0
