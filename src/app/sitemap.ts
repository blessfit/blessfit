import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// A loja é uma página só; o painel /admin fica de fora.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: 'weekly', priority: 1 }]
}
