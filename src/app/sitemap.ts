import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// A loja é uma página só (mais a política de privacidade); o painel /admin e as páginas da conta ficam de fora.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
