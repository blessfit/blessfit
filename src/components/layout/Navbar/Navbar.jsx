import { AnimatePresence, useMotionValueEvent, useScroll } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Instagram, WhatsApp, Wordmark } from '@/components/ui'
import { NAV, SITE } from '@/data/site'
import { EASE, EASE_IO } from '@/lib/ease'
import { external, instagramUrl, whatsappUrl } from '@/lib/links'
import { lockScroll, unlockScroll } from '@/lib/scroll'
import { DESKTOP_QUERY } from '@/styles/media'
import * as S from './Navbar.styles'

export function Navbar() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)

  // some ao rolar para baixo, volta ao rolar para cima
  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setSolid(y > 24)
    setHidden(y > previous && y > 360)
  })

  const openMenu = () => {
    if (openRef.current) return
    openRef.current = true
    setOpen(true)
    lockScroll()
  }

  const closeMenu = useCallback(() => {
    if (!openRef.current) return
    openRef.current = false
    setOpen(false)
    unlockScroll()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && closeMenu()
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const onResize = () => desktop.matches && closeMenu()
    window.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onResize)
    }
  }, [open, closeMenu])

  return (
    <>
      <S.Header
        $solid={solid || open}
        animate={{ y: hidden && !open ? '-100%' : '0%' }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <S.Inner>
          <S.Logo href="#top" aria-label="blessfit — voltar ao início" onClick={closeMenu}>
            <Wordmark />
          </S.Logo>

          <S.Links aria-label="Principal">
            {NAV.map((item) => (
              <S.Link key={item.href} href={item.href}>
                {item.label}
              </S.Link>
            ))}
          </S.Links>

          <S.Actions>
            <S.Cta variant="lineCream" size="sm" icon={ArrowUpRight} href={whatsappUrl()} {...external}>
              Comprar
            </S.Cta>
            <S.Burger
              type="button"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={open ? closeMenu : openMenu}
            >
              <span />
              <span />
            </S.Burger>
          </S.Actions>
        </S.Inner>
      </S.Header>

      <AnimatePresence>{open && <MobileMenu onClose={closeMenu} />}</AnimatePresence>
    </>
  )
}

function MobileMenu({ onClose }) {
  const firstLink = useRef(null)

  useEffect(() => {
    firstLink.current?.focus({ preventScroll: true })
  }, [])

  return (
    <S.Menu
      id="menu-mobile"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      transition={{ duration: 0.8, ease: EASE_IO }}
    >
      <S.MenuLinks aria-label="Seções">
        {NAV.map((item, i) => (
          <S.MenuLink
            key={item.href}
            ref={i === 0 ? firstLink : undefined}
            href={item.href}
            onClick={onClose}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.25 + i * 0.06 }}
          >
            <small>{String(i + 1).padStart(2, '0')}</small>
            {item.label}
          </S.MenuLink>
        ))}
      </S.MenuLinks>

      <S.MenuFoot initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
        <S.MenuSocial>
          <a href={whatsappUrl()} {...external}>
            <WhatsApp /> WhatsApp
          </a>
          <a href={instagramUrl} {...external}>
            <Instagram /> @{SITE.instagram}
          </a>
        </S.MenuSocial>
        <S.MenuVerse>
          {SITE.tagline}
          <br />
          {SITE.verseRef}
        </S.MenuVerse>
      </S.MenuFoot>
    </S.Menu>
  )
}
