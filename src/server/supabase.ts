/*
 * Clientes do Supabase usados no servidor.
 *
 * - db(): chave secreta, ignora o RLS. Só em rotas, server actions e páginas já protegidas.
 * - authClient(): sessão do usuário logado (cookies), para o login do painel.
 */
import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { stockKey, type LiveCatalog } from '@/data/live'

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

let admin: SupabaseClient | undefined

export function db(): SupabaseClient {
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url() || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY não configurados')
  admin ??= createClient(url()!, key, { auth: { persistSession: false } })
  return admin
}

export async function authClient() {
  // ler os cookies primeiro: é isso que marca a página como dinâmica (o build não tenta pré-renderizar o painel)
  const store = await cookies()
  if (!url() || !publishableKey()) throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não configurados')
  return createServerClient(url()!, publishableKey()!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options)
        } catch {
          // chamado de um Server Component: quem renova a sessão é o src/proxy.ts
        }
      },
    },
  })
}

type ProductRow = { id: string; price: number; pix: number; compare_at: number | null; active: boolean }
type StockRow = { product_id: string; color: string; size: string; quantity: number | null }

/** Preços e estoque do painel. null se o banco não estiver configurado ou não responder. */
export async function getLiveCatalog(): Promise<LiveCatalog | null> {
  if (!url() || !publishableKey()) return null
  const client = createClient(url()!, publishableKey()!, { auth: { persistSession: false } })
  const [products, stock] = await Promise.all([
    client.from('products').select('id, price, pix, compare_at, active').returns<ProductRow[]>(),
    client.from('stock').select('product_id, color, size, quantity').returns<StockRow[]>(),
  ])
  if (products.error || stock.error) {
    console.error('[catalog] erro ao ler preços/estoque', products.error ?? stock.error)
    return null
  }

  return {
    products: Object.fromEntries(
      products.data.map((p) => [
        p.id,
        { price: Number(p.price), pix: Number(p.pix), compareAt: p.compare_at === null ? null : Number(p.compare_at), active: p.active },
      ]),
    ),
    stock: Object.fromEntries(stock.data.map((s) => [stockKey(s.product_id, s.color, s.size), s.quantity])),
  }
}
