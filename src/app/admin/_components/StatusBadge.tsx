import type { OrderStatus } from '@/server/orders'
import s from '../admin.module.css'
import { STATUS_LABEL } from '../labels'

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={s.badge} data-status={status}>
    {STATUS_LABEL[status]}
  </span>
)
