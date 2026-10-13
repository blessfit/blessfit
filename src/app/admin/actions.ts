'use server'

/*
 * Ações do painel. Toda ação é um endpoint público: cada uma confere o login com requireAdmin()
 * antes de tocar no banco.
 */
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { CATALOG } from '@/data/catalog'
import { isAdmin, requireAdmin } from '@/server/auth'
import type { OrderStatus } from '@/server/orders'
import { authClient, db } from '@/server/supabase'
import { ORDER_STATUSES } from './labels'

export async function signIn(form: FormData) {
  const email = String(form.get('email') ?? '').trim()
  const password = String(form.get('password') ?? '')
  const supabase = await authClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/admin/login?erro=senha')
  if (!isAdmin(email)) {
    await supabase.auth.signOut()
    redirect('/admin/login?erro=acesso')
  }
  redirect('/admin')
}

export async function signOut() {
  const supabase = await authClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function updateOrderStatus(form: FormData) {
  await requireAdmin()
  const id = String(form.get('id') ?? '')
  const status = String(form.get('status') ?? '') as OrderStatus
  if (!ORDER_STATUSES.includes(status)) throw new Error('Status inválido')

  const { error } = await db().from('orders').update({ status }).eq('id', id)
  if (error) throw error
  revalidatePath('/admin')
}

/** "154,90" ou "154.90" → 154.9; vazio → null. */
function money(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? '').trim()
  // com vírgula, o ponto é separador de milhar (1.154,90); sem vírgula, o ponto é o decimal (154.90)
  const text = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw
  if (!text) return null
  const number = Number(text)
  if (!Number.isFinite(number) || number <= 0) throw new Error(`Valor inválido: ${String(value)}`)
  return Math.round(number * 100) / 100
}

/** Salva preço, “de”, ativo e o estoque de cada cor × tamanho de um produto. */
export async function saveProduct(form: FormData) {
  await requireAdmin()
  const product = CATALOG.find((p) => p.id === form.get('id'))
  if (!product) throw new Error('Produto não encontrado')

  const price = money(form.get('price'))
  const pix = money(form.get('pix'))
  if (price === null || pix === null) throw new Error('Preço no cartão e no Pix são obrigatórios')
  const now = new Date().toISOString()

  const stock = product.variants.flatMap(({ color }) =>
    product.sizes.map((size) => {
      const raw = String(form.get(`stock:${color.name}:${size}`) ?? '').trim()
      const quantity = raw === '' ? null : Number(raw)
      if (quantity !== null && (!Number.isInteger(quantity) || quantity < 0)) {
        throw new Error(`Estoque inválido em ${color.name} ${size}`)
      }
      return { product_id: product.id, color: color.name, size, quantity, updated_at: now }
    }),
  )

  const [saved, savedStock] = await Promise.all([
    db()
      .from('products')
      .upsert({
        id: product.id,
        price,
        pix,
        compare_at: money(form.get('compare_at')),
        active: form.get('active') === 'on',
        updated_at: now,
      }),
    db().from('stock').upsert(stock),
  ])
  if (saved.error) throw saved.error
  if (savedStock.error) throw savedStock.error

  revalidatePath('/')
  redirect(`/admin/estoque?salvo=${product.id}#${product.id}`)
}
