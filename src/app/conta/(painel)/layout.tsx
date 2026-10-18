import type { ReactNode } from 'react'
import { currentUser, getCustomer } from '@/server/customers'
import { AccountShell } from '@/views/Account'
import { AccountApp } from '../../providers/AccountApp'

/**
 * Moldura de /conta/pedidos e /conta/dados: fica montada ao trocar de tela, e só o conteúdo
 * (com o loading.tsx de cada uma) é trocado. Sem login, cada página manda para /entrar.
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await currentUser()
  const customer = user ? await getCustomer(user.id) : null

  return (
    <AccountApp crumb="Minha conta">
      {user ? (
        <AccountShell name={customer?.name ?? ''} email={user.email ?? ''}>
          {children}
        </AccountShell>
      ) : (
        children
      )}
    </AccountApp>
  )
}
