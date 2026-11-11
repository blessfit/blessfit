import { requireAdmin } from '@/server/auth'
import { couponState, listCoupons } from '@/server/coupons'
import { CouponRow, NewCoupon, type CouponView } from '../../_components/CouponEditor'
import s from '../../admin.module.css'

export default async function CouponsPage() {
  await requireAdmin()
  const now = new Date()
  const coupons: CouponView[] = (await listCoupons()).map(({ coupon, uses }) => ({
    code: coupon.code,
    percent: coupon.percent,
    maxUses: coupon.max_uses,
    firstPurchaseOnly: coupon.first_purchase_only,
    startsAt: coupon.starts_at,
    endsAt: coupon.ends_at,
    active: coupon.active,
    uses,
    state: couponState(coupon, uses, now),
  }))

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>Cupons</h1>
          <p>
            Desconto percentual nos produtos (o frete não tem desconto). Um uso conta quando o pedido é pago. Horários
            de Brasília. Cupom não se apaga: desligue para parar de aceitar.
          </p>
        </div>
      </div>

      <section className={s.card} style={{ marginBottom: 20 }}>
        <div className={s.cardHead}>
          <h2>Novo cupom</h2>
        </div>
        <NewCoupon />
      </section>

      <section className={s.card}>
        {coupons.length === 0 ? (
          <p className={s.empty}>Nenhum cupom ainda.</p>
        ) : (
          <>
            <div className={`${s.couponRow} ${s.orderHeader} ${s.couponHeader}`} aria-hidden="true">
              <span>Código</span>
              <span>Desconto</span>
              <span>Usos</span>
              <span>Validade</span>
              <span>Situação</span>
              <span />
            </div>
            {coupons.map((coupon) => (
              <CouponRow key={coupon.code} coupon={coupon} />
            ))}
          </>
        )}
      </section>
    </>
  )
}
