import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Libera a loja para buscadores e esconde o painel e as rotas internas.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
