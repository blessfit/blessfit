/* Esqueletos das telas do painel: aparecem na hora do clique, enquanto os dados carregam. */
import s from '../admin.module.css'

export const Bone = ({ w = '100%', h = 14, r }: { w?: number | string; h?: number; r?: number }) => (
  <span className={s.bone} style={{ width: w, height: h, borderRadius: r }} />
)

const Head = ({ subtitle = true }: { subtitle?: boolean }) => (
  <div className={s.pageHead} aria-hidden="true">
    <div style={{ display: 'grid', gap: 10 }}>
      <Bone w={180} h={28} />
      {subtitle && <Bone w={280} h={14} />}
    </div>
  </div>
)

const Rows = ({ count = 5, thumb = false, columns = 3 }: { count?: number; thumb?: boolean; columns?: number }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className={s.skeletonRow}>
        {thumb && <Bone w={40} h={50} r={8} />}
        <span style={{ display: 'grid', gap: 8, flex: 1 }}>
          <Bone w="45%" />
          <Bone w="28%" h={11} />
        </span>
        {Array.from({ length: columns - 1 }, (_, j) => (
          <Bone key={j} w={90} h={18} r={999} />
        ))}
      </div>
    ))}
  </>
)

/** Carregando… (texto só para leitores de tela). */
const Loading = () => (
  <span className={s.srOnly} role="status">
    Carregando…
  </span>
)

export function DashboardSkeleton() {
  return (
    <>
      <Loading />
      <Head />
      <div className={s.stats} aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`${s.card} ${s.stat}`} style={{ display: 'grid', gap: 12 }}>
            <Bone w={110} />
            <Bone w={140} h={26} />
            <Bone w="80%" h={11} />
          </div>
        ))}
      </div>
      <div className={s.columns} aria-hidden="true">
        <section className={s.card}>
          <div className={s.cardHead}>
            <Bone w={130} h={16} />
          </div>
          <Rows count={5} />
        </section>
        <section className={s.card}>
          <div className={s.cardHead}>
            <Bone w={130} h={16} />
          </div>
          <Rows count={4} thumb columns={2} />
        </section>
      </div>
    </>
  )
}

export function ListSkeleton({ thumb = false, filters = true }: { thumb?: boolean; filters?: boolean }) {
  return (
    <>
      <Loading />
      <Head />
      {filters && (
        <div className={s.toolbar} aria-hidden="true">
          <Bone w={360} h={40} r={10} />
          <Bone w={90} h={40} r={10} />
        </div>
      )}
      <section className={s.card} aria-hidden="true">
        <Rows count={8} thumb={thumb} columns={4} />
      </section>
    </>
  )
}

export function StockSkeleton() {
  return (
    <>
      <Loading />
      <Head />
      <div className={s.toolbar} aria-hidden="true">
        <Bone w={360} h={40} r={10} />
        <Bone w={150} h={40} r={10} />
        <Bone w={150} h={40} r={10} />
      </div>
      <div className={s.products} aria-hidden="true">
        {Array.from({ length: 3 }, (_, i) => (
          <section key={i} className={s.card}>
            <div className={s.productHead}>
              <Bone w={40} h={50} r={8} />
              <span style={{ display: 'grid', gap: 8, flex: 1 }}>
                <Bone w={180} h={16} />
                <Bone w={220} h={11} />
              </span>
            </div>
            {Array.from({ length: 2 }, (_, j) => (
              <div key={j} className={s.skeletonRow}>
                <Bone w={140} />
                {Array.from({ length: 5 }, (_, k) => (
                  <Bone key={k} w={112} h={36} r={10} />
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  )
}

export function OrderSkeleton() {
  return (
    <>
      <Loading />
      <Bone w={80} />
      <div style={{ height: 14 }} />
      <Head />
      <div className={s.columns} aria-hidden="true">
        <section className={s.card}>
          <div className={s.cardHead}>
            <Bone w={100} h={16} />
          </div>
          <Rows count={3} thumb columns={2} />
        </section>
        <div className={s.stack}>
          {Array.from({ length: 2 }, (_, i) => (
            <section key={i} className={s.card}>
              <div className={s.cardHead}>
                <Bone w={100} h={16} />
              </div>
              <div className={s.cardBody} style={{ display: 'grid', gap: 12 }}>
                <Bone w="60%" />
                <Bone w="40%" />
                <Bone h={40} r={10} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
