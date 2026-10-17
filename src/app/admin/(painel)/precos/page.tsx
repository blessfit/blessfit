import { CATALOG } from '@/data/catalog'
import { requireAdmin } from '@/server/auth'
import { getLiveCatalog } from '@/server/supabase'
import { ExportButton } from '../../_components/ExportButton'
import { AlertIcon } from '../../_components/Icons'
import { PriceEditor } from '../../_components/PriceEditor'
import s from '../../admin.module.css'
import { productPhoto } from '../../photos'

/** Valor no formato brasileiro para o campo (154.9 → "154,90"). */
const money = (value: number | null | undefined) => (value == null ? '' : value.toFixed(2).replace('.', ','))

export default async function PricesPage() {
  await requireAdmin()
  const live = await getLiveCatalog()

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>Preços</h1>
          <p>
            Cartão (em até 6x), Pix e preço “de” (gera o selo de desconto). “Frete grátis”: pedido com o produto tem a
            opção de frete mais barata grátis. O site atualiza assim que você salva.
          </p>
        </div>
        <ExportButton />
      </div>

      {!live && (
        <p className={s.alert}>
          <AlertIcon />
          <span>Não foi possível ler o banco agora. Os valores abaixo são os do catálogo.</span>
        </p>
      )}

      <section className={s.card}>
        <div className={`${s.priceRow} ${s.orderHeader} ${s.priceHeader}`} aria-hidden="true">
          <span />
          <span>Produto</span>
          <span>Cartão</span>
          <span>Pix</span>
          <span>Preço “de”</span>
          <span>No site · frete</span>
          <span />
        </div>
        {CATALOG.map((product) => {
          const row = live?.products[product.id]
          return (
            <PriceEditor
              key={product.id}
              productId={product.id}
              name={product.name}
              meta={`Ref. ${product.ref} · ${product.category}`}
              photo={productPhoto(product.id)}
              initial={{
                price: money(row?.price ?? product.price),
                pix: money(row?.pix ?? product.pix),
                compareAt: money(row ? row.compareAt : product.compareAt),
                active: row?.active ?? true,
                freeShipping: row?.freeShipping ?? product.freeShipping ?? false,
              }}
            />
          )
        })}
      </section>
    </>
  )
}
