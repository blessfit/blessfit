import { useTransition } from 'react'
import { signOut } from '@/app/conta/actions'

/**
 * Sair da conta com loading no botão. Depois recarrega a página (o header volta ao "Entrar");
 * nas telas da conta, que pedem login, vai para a página inicial.
 */
export function useSignOut(): [pending: boolean, run: () => void] {
  const [pending, startTransition] = useTransition()
  const run = () =>
    startTransition(async () => {
      await signOut()
      if (window.location.pathname.startsWith('/conta')) window.location.assign('/')
      else window.location.reload()
      await new Promise(() => {}) // segura o loading até a página trocar
    })
  return [pending, run]
}
