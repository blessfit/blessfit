import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NAV, SITE } from '../data/site'
import { EASE, EASE_IO } from '../lib/ease'
import { external, instagramUrl, whatsappUrl } from '../lib/links'
import { lockScroll, unlockScroll } from '../lib/scroll'
import { ArrowUpRight, Instagram, WhatsApp } from './Icons'
import { Wordmark } from './Logo'
import './Navbar.css'

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
    const desktop = window.matchMedia('(min-width: 900px)')
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
      <motion.header
        className={`nav${solid || open ? ' nav--solid' : ''}`}
        animate={{ y: hidden && !open ? '-100%' : '0%' }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="container nav__inner">
          <a href="#top" className="nav__logo" aria-label="blessfit — voltar ao início" onClick={closeMenu}>
            <Wordmark />
          </a>

          <nav className="nav__links" aria-label="Principal">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="nav__link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <a className="btn btn--line-cream btn--sm nav__cta" href={whatsappUrl()} {...external}>
              Comprar
              <ArrowUpRight className="btn__icon" />
            </a>
            <button
              type="button"
              className="nav__burger"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              aria-controls="menu-mobile"
              onClick={open ? closeMenu : openMenu}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.header>

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
    <motion.div
      id="menu-mobile"
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      transition={{ duration: 0.8, ease: EASE_IO }}
    >
      <nav className="menu__links" aria-label="Seções">
        {NAV.map((item, i) => (
          <motion.a
            key={item.href}
            ref={i === 0 ? firstLink : undefined}
            href={item.href}
            className="menu__link"
            onClick={onClose}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.25 + i * 0.06 }}
          >
            <small>{String(i + 1).padStart(2, '0')}</small>
            {item.label}
          </motion.a>
        ))}
      </nav>

      <motion.div
        className="menu__foot"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="menu__social">
          <a href={whatsappUrl()} {...external}>
            <WhatsApp /> WhatsApp
          </a>
          <a href={instagramUrl} {...external}>
            <Instagram /> @{SITE.instagram}
          </a>
        </div>
        <p className="menu__verse">
          {SITE.tagline}
          <br />
          {SITE.verseRef}
        </p>
      </motion.div>
    </motion.div>
  )
}
