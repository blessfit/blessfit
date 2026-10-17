import type { Metadata } from 'next'
import OrderApp from './OrderApp'

export const metadata: Metadata = {
  title: 'Seu pedido · Blessfit',
  robots: { index: false },
}

export default async function OrderRoute({ params }: { params: Promise<{ id: string }> }) {
  return <OrderApp id={(await params).id} />
}
