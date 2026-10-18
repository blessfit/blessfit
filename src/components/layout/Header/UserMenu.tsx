import { useEffect, useRef, useState } from 'react'
import { signOut } from '@/app/conta/actions'
import { ChevronDown, User } from '@/components/ui'
import * as S from './Header.styles'

type Me = { name: string; email: string; avatar: string }

/**
 * Conta no header: ícone "Entrar" deslogado; "Olá, Nome" quando logado, com menu que abre ao passar o
 * mouse (no toque, ao tocar).
 */
export function UserMenu() {
  const [me, setMe] = useState<Me | null>(null)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // as páginas são estáticas (não leem cookies): pergunta quem está logado depois de carregar
  useEffect(() => {
    fetch('/api/conta')
      .then((r) => (r.ok ? (r.json() as Promise<Me>) : null))
      .then(setMe)
      .catch(() => setMe(null))
  }, [])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!me) {
    return (
      <S.Account as="a" href="/conta" aria-label="Entrar ou criar conta" title="Entrar ou criar conta">
        <User />
      </S.Account>
    )
  }

  // só mouse: o toque também dispara mouseenter, e aí o clique fecharia o menu que acabou de abrir
  const hover = (e: React.PointerEvent, value: boolean) => {
    if (e.pointerType !== 'mouse') return
    clearTimeout(closeTimer.current)
    if (value) setOpen(true)
    else closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const first = me.name.trim().split(/\s+/)[0] || me.email.split('@')[0]
  return (
    <S.UserMenu ref={root} onPointerEnter={(e) => hover(e, true)} onPointerLeave={(e) => hover(e, false)}>
      <S.UserButton type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        <S.Avatar aria-hidden="true">
          {me.avatar ? <img src={me.avatar} alt="" referrerPolicy="no-referrer" /> : first.charAt(0).toUpperCase()}
        </S.Avatar>
        <S.Hello>
          Olá, <strong>{first}</strong>
        </S.Hello>
        <ChevronDown />
      </S.UserButton>
      {open && (
        <S.UserDropdown role="menu">
          <a role="menuitem" href="/conta/pedidos">
            Meus pedidos
          </a>
          <a role="menuitem" href="/conta/dados">
            Meus dados
          </a>
          <form action={signOut}>
            <button role="menuitem" type="submit">
              Sair
            </button>
          </form>
        </S.UserDropdown>
      )}
    </S.UserMenu>
  )
}
