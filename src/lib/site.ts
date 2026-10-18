/** Endereço público da loja (SEO, og:image, robots e sitemap). `SITE_URL` sobrescreve, sem barra no fim. */
export const SITE_URL = process.env.SITE_URL ?? 'https://www.blessfitstore.com.br'

/**
 * Pagamento pelo site (InfinitePay). Só com NEXT_PUBLIC_ONLINE_CHECKOUT=on; sem ela, "Finalizar compra" vai
 * para o WhatsApp e /api/checkout recusa. Liga por ambiente na Vercel (e no .env.local) — precisa de novo deploy.
 */
export const ONLINE_CHECKOUT = process.env.NEXT_PUBLIC_ONLINE_CHECKOUT === 'on'
