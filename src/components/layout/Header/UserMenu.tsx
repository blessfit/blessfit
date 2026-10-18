import Link from 'next/link'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { signOut } from '@/app/conta/actions'
import { ChevronDown, User } from '@/components/ui'
import { firstName, useMe } from '@/hooks/useMe'
import * as S from './Header.styles'

/**
 * Conta no header (só tablet/desktop; no celular fica no menu lateral): ícone "Entrar" deslogado;
 * "Olá, Nome" quando logado, com menu que abre ao passar o mouse (no toque, ao tocar).
 */
export function UserMenu() {
  const me = useMe()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

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

  // só mouse: o toque também dispara pointerenter, e aí o clique fecharia o menu que acabou de abrir
  const hover = (e: PointerEvent, value: boolean) => {
    if (e.pointerType !== 'mouse') return
    clearTimeout(closeTimer.current)
    if (value) setOpen(true)
    else closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const first = firstName(me)
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
          <Link role="menuitem" href="/conta/pedidos" onClick={() => setOpen(false)}>
            Meus pedidos
          </Link>
          <Link role="menuitem" href="/conta/dados" onClick={() => setOpen(false)}>
            Meus dados
          </Link>
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
