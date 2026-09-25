import { SITE } from '../data/site'

const DEFAULT_MESSAGE = 'Olá! Vim pelo site da blessfit e quero saber mais sobre as peças.'

export const whatsappUrl = (message = DEFAULT_MESSAGE) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`

export const instagramUrl = `https://www.instagram.com/${SITE.instagram}/`

/** Props para links externos (abrem em nova aba com segurança). */
export const external = { target: '_blank', rel: 'noopener noreferrer' }
