import { redirect } from 'next/navigation'

/** /conta abre em "Meus pedidos" (links antigos e o ícone do header continuam valendo). */
export default async function AccountRoute({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const { senha } = await searchParams
  redirect(senha === 'ok' ? '/conta/dados?senha=ok' : '/conta/pedidos')
}
