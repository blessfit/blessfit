import { useEffect, useState } from 'react'

/** Cliente logado (GET /api/conta), ou null. */
export type Me = { name: string; email: string; avatar: string }

// uma requisição por página: o header e o menu do celular usam o mesmo resultado
let request: Promise<Me | null> | null = null

/**
 * As páginas da loja são estáticas (não leem cookies): pergunta quem está logado depois de carregar.
 * `undefined` enquanto carrega.
 */
export function useMe(): Me | null | undefined {
  const [me, setMe] = useState<Me | null | undefined>(undefined)
  useEffect(() => {
    request ??= fetch('/api/conta')
      .then((r) => (r.ok ? (r.json() as Promise<Me>) : null))
      .catch(() => null)
    request.then(setMe)
  }, [])
  return me
}

export const firstName = (me: Me) => me.name.trim().split(/\s+/)[0] || me.email.split('@')[0]
