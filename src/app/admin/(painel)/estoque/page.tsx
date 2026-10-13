import { CATALOG } from '@/data/catalog'
import { stockOf } from '@/data/live'
import { requireAdmin } from '@/server/auth'
import { getLiveCatalog } from '@/server/supabase'
import { saveProduct } from '../../actions'
import s from '../../admin.module.css'
import { LOW_STOCK } from '../../labels'

const level = (quantity: number | null) =>
  quantity === null ? undefined : quantity === 0 ? 'out' : quantity <= LOW_STOCK ? 'low' : undefined

/** Valor do campo de preço no formato brasileiro (154,9 → "154,90"). */
const money = (value: number | null | undefined) => (value == null ? '' : value.toFixed(2).replace('.', ','))

export default async function StockPage({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  await requireAdmin()
  const { salvo } = await searchParams
  const live = await getLiveCatalog()
  const saved = CATALOG.find((p) => p.id === salvo)

  const alerts = CATALOG.flatMap((product) =>
    product.variants.flatMap(({ color }) =>
      product.sizes.flatMap((size) => {
        const quantity = stockOf(live, product.id, color.name, size)
        return level(quantity) ? [{ product, color: color.name, size, quantity: quantity! }] : []
      }),
    ),
  )

  return (
    <>
      <h1 className={s.title}>Estoque e preços</h1>
      {saved && <p className={s.notice}>{saved.name} salvo. O site atualiza em instantes.</p>}
      {!live && (
        <p className={s.alert}>Não foi possível ler o banco. Os valores abaixo são os do catálogo (src/data/catalog.ts).</p>
      )}
      {alerts.length > 0 && (
        <div className={s.alert}>
          <strong>Repor estoque</strong>
          <ul>
            {alerts.map((a) => (
              <li key={`${a.product.id}-${a.color}-${a.size}`}>
                <a href={`#${a.product.id}`}>{a.product.name}</a> · {a.color} · {a.size}:{' '}
                {a.quantity === 0 ? 'esgotado' : `${a.quantity} un.`}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className={s.hint}>
        Estoque em branco = sem controle (o tamanho fica sempre disponível). Com 0, o tamanho aparece esgotado no
        site. As vendas pagas dão baixa sozinhas.
      </p>

      <div className={s.products}>
        {CATALOG.map((product) => {
          const row = live?.products[product.id]
          const active = row?.active ?? true
          return (
            <form key={product.id} id={product.id} action={saveProduct} className={s.product} data-inactive={!active}>
              <input type="hidden" name="id" value={product.id} />
              <div className={s.productHead}>
                <h2>{product.name}</h2>
                <span className={s.muted}>
                  Ref. {product.ref} · {product.category}
                </span>
              </div>

              <div className={s.prices}>
                <label className={s.field}>
                  Cartão (R$)
                  <input className={s.input} name="price" inputMode="decimal" required defaultValue={money(row?.price ?? product.price)} />
                </label>
                <label className={s.field}>
                  Pix (R$)
                  <input className={s.input} name="pix" inputMode="decimal" required defaultValue={money(row?.pix ?? product.pix)} />
                </label>
                <label className={s.field}>
                  Preço “de” (R$)
                  <input
                    className={s.input}
                    name="compare_at"
                    inputMode="decimal"
                    placeholder="opcional"
                    defaultValue={money(row ? row.compareAt : product.compareAt)}
                  />
                </label>
                <label className={s.check}>
                  <input type="checkbox" name="active" defaultChecked={active} />
                  À venda no site
                </label>
              </div>

              <div className={s.tableWrap}>
                <table className={s.stock}>
                  <thead>
                    <tr>
                      <th scope="col">Cor</th>
                      {product.sizes.map((size) => (
                        <th key={size} scope="col">
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map(({ color }) => (
                      <tr key={color.name}>
                        <th scope="row">{color.name}</th>
                        {product.sizes.map((size) => {
                          const quantity = stockOf(live, product.id, color.name, size)
                          return (
                            <td key={size} data-level={level(quantity)}>
                              <input
                                className={s.input}
                                name={`stock:${color.name}:${size}`}
                                type="number"
                                min={0}
                                step={1}
                                inputMode="numeric"
                                defaultValue={quantity ?? ''}
                                aria-label={`Estoque ${color.name} ${size}`}
                              />
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className={s.button} type="submit">
                Salvar {product.name}
              </button>
            </form>
          )
        })}
      </div>
    </>
  )
}
