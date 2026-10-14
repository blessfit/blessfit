import Form from 'next/form'
import Link from 'next/link'
import { CATALOG } from '@/data/catalog'
import { IMAGES } from '@/data/images'
import { stockOf } from '@/data/live'
import { LOW_STOCK, restockList } from '@/server/admin'
import { requireAdmin } from '@/server/auth'
import { getLiveCatalog } from '@/server/supabase'
import { ExportButton } from '../../_components/ExportButton'
import { AlertIcon, SearchIcon } from '../../_components/Icons'
import { SubmitButton } from '../../_components/Pending'
import { StockEditor } from '../../_components/StockEditor'
import s from '../../admin.module.css'

type Params = { linha?: string; tipo?: string; baixo?: string; q?: string }

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export default async function StockPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin()
  const params = await searchParams
  const live = await getLiveCatalog()
  const restock = restockList(live)
  const lowIds = new Set(restock.map((r) => r.product.id))
  const q = normalize(params.q?.trim() ?? '')

  const products = CATALOG.filter(
    (p) =>
      (!params.linha || p.gender === params.linha) &&
      (!params.tipo || (params.tipo === 'Conjunto' ? p.kind === 'Conjunto' : p.kind !== 'Conjunto')) &&
      (!params.baixo || lowIds.has(p.id)) &&
      (!q || normalize(`${p.name} ${p.ref} ${p.category}`).includes(q)),
  )

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>Estoque</h1>
          <p>Quantidade de cada cor e tamanho. As vendas pagas dão baixa sozinhas.</p>
        </div>
        <ExportButton />
      </div>

      {!live && (
        <p className={s.alert}>
          <AlertIcon />
          <span>Não foi possível ler o banco agora. Os números abaixo podem estar desatualizados.</span>
        </p>
      )}

      <Form action="/admin/estoque" className={s.filters} role="search">
        <label className={s.search}>
          <SearchIcon />
          <span className={s.srOnly}>Buscar produto</span>
          <input className={s.input} name="q" defaultValue={params.q} placeholder="Buscar produto ou referência" />
        </label>
        <select className={s.select} name="linha" defaultValue={params.linha ?? ''} aria-label="Linha">
          <option value="">Todas as linhas</option>
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
        </select>
        <select className={s.select} name="tipo" defaultValue={params.tipo ?? ''} aria-label="Tipo">
          <option value="">Conjuntos e peças</option>
          <option value="Conjunto">Só conjuntos</option>
          <option value="Pecas">Só peças avulsas</option>
        </select>
        <label className={s.check}>
          <input type="checkbox" name="baixo" value="1" defaultChecked={!!params.baixo} />
          Só para repor ({restock.length})
        </label>
        <SubmitButton className={`${s.button} ${s.secondary}`}>Filtrar</SubmitButton>
      </Form>

      <p className={s.hint}>
        Campo vazio (—) = sem controle de estoque: o tamanho fica sempre disponível. Com 0, aparece esgotado no site. Até{' '}
        {LOW_STOCK} un. fica em destaque para repor.
      </p>

      {products.length === 0 && (
        <p className={`${s.card} ${s.empty}`}>
          Nenhum produto com esses filtros. <Link href="/admin/estoque">Limpar filtros</Link>
        </p>
      )}

      <div className={s.products}>
        {products.map((product) => {
          const out = restock.filter((r) => r.product.id === product.id && r.quantity === 0).length
          const cover = IMAGES.products[product.variants[0].images].main.src
          return (
            <section key={product.id} id={product.id} className={s.card} style={{ scrollMarginTop: 80 }}>
              <div className={s.productHead}>
                <img className={`${s.thumb} ${s.thumbSm}`} src={cover} alt="" />
                <div>
                  <h2>{product.name}</h2>
                  <p>
                    Ref. {product.ref} · {product.category}
                  </p>
                </div>
                {out > 0 && <span className={s.tag}>{out} esgotado(s)</span>}
              </div>
              <StockEditor
                productId={product.id}
                sizes={product.sizes}
                lowStock={LOW_STOCK}
                colors={product.variants.map((v) => ({
                  name: v.color.name,
                  hex: v.color.hex,
                  photo: IMAGES.products[v.images].main.src,
                }))}
                initial={Object.fromEntries(
                  product.variants.flatMap((v) =>
                    product.sizes.map((size) => [
                      `${v.color.name}|${size}`,
                      stockOf(live, product.id, v.color.name, size),
                    ]),
                  ),
                )}
              />
            </section>
          )
        })}
      </div>
    </>
  )
}
