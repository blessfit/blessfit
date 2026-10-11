import { SHOP } from '@/data/shop'

const DEFAULT_MESSAGE = 'Olá! Vim pelo site da Blessfit e quero saber mais sobre as peças.'

export const whatsappUrl = (message: string = DEFAULT_MESSAGE): string =>
  `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`

export const instagramUrl = `https://www.instagram.com/${SHOP.instagram}/`

/** Props para links externos (abrem em nova aba com segurança). */
export const external = { target: '_blank', rel: 'noopener noreferrer' } as const
