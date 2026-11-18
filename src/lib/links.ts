import { SHOP } from '@/data/shop'

const DEFAULT_MESSAGE = 'Olá! Vim pelo site da Blessfit e quero saber mais sobre as peças.'

/**
 * api.whatsapp.com/send em vez de wa.me: o redirecionamento do wa.me estraga emojis fora do básico
 * (🛍️ 👤 📦 viram "�" na mensagem do pedido).
 */
export const whatsappUrl = (message: string = DEFAULT_MESSAGE): string =>
  `https://api.whatsapp.com/send?phone=${SHOP.whatsapp}&text=${encodeURIComponent(message)}`

export const instagramUrl = `https://www.instagram.com/${SHOP.instagram}/`

/** Props para links externos (abrem em nova aba com segurança). */
export const external = { target: '_blank', rel: 'noopener noreferrer' } as const
