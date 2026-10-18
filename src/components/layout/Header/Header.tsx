import { useEffect, useState } from 'react'
import { Bag, CountBadge, IconButton, Menu, Wordmark } from '@/components/ui'
import { NAV } from '@/data/shop'
import { useStore } from '@/store/storeContext'
import * as S from './Header.styles'
import { SearchBox } from './SearchBox'
import { UserMenu } from './UserMenu'

/** Header da loja: busca, logo central, conta/sacola e menu de categorias. */
export function Header() {
  const { bagCount, openPanel } = useStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <S.Root $scrolled={scrolled}>
      <S.Top>
        <S.Left>
          <S.MenuButton type="button" aria-label="Abrir menu" onClick={() => openPanel('menu')}>
            <Menu />
          </S.MenuButton>
          <S.DesktopSearch>
            <SearchBox />
          </S.DesktopSearch>
        </S.Left>

        <S.Logo href="#top" aria-label="Blessfit — início">
          <Wordmark />
        </S.Logo>

        <S.Right>
          <UserMenu />
          <IconButton type="button" aria-label={`Sacola (${bagCount} itens)`} onClick={() => openPanel('bag')}>
            <Bag />
            {bagCount > 0 && <CountBadge aria-hidden="true">{bagCount}</CountBadge>}
          </IconButton>
        </S.Right>
      </S.Top>

      <S.MobileSearch>
        <SearchBox />
      </S.MobileSearch>

      <S.Nav aria-label="Principal">
        <ul>
          {NAV.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </S.Nav>
    </S.Root>
  )
}
