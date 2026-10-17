'use client'

import { OrderPage } from '@/views/Order/OrderPage'
import { AppProviders } from '../../providers/AppProviders'

export default function OrderApp({ id }: { id: string }) {
  return (
    <AppProviders live={null}>
      <OrderPage id={id} />
    </AppProviders>
  )
}
