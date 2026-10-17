import type { Metadata } from 'next'
import { getLiveCatalog } from '@/server/supabase'
import CartApp from './CartApp'

export const metadata: Metadata = {
  title: 'Carrinho · Blessfit',
  robots: { index: false },
}

// mesmos preços e estoque da loja, atualizados no máximo a cada minuto
export const revalidate = 60

export default async function CartRoute() {
  return <CartApp live={await getLiveCatalog()} />
}
