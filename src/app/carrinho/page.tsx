import type { Metadata } from 'next'
import { getCampaign } from '@/server/campaign'
import { getLiveCatalog } from '@/server/supabase'
import CartApp from './CartApp'

export const metadata: Metadata = {
  title: 'Carrinho · Blessfit',
  robots: { index: false },
}

// mesmos preços e estoque da loja, atualizados no máximo a cada minuto
export const revalidate = 60

export default async function CartRoute() {
  const [live, campaign] = await Promise.all([getLiveCatalog(), getCampaign()])
  return <CartApp live={live} campaign={campaign} />
}
