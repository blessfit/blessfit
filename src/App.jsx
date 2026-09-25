import { AnimatePresence, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Collection } from './components/Collection'
import { Community } from './components/Community'
import { Details } from './components/Details'
import { Faq } from './components/Faq'
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Loader } from './components/Loader'
import { Manifesto } from './components/Manifesto'
import { Marquee } from './components/Marquee'
import { Navbar } from './components/Navbar'
import { Pillars } from './components/Pillars'
import { Verse } from './components/Verse'
import { WhatsAppFab } from './components/WhatsAppFab'
import { initSmoothScroll, lockScroll, scrollToElement, unlockScroll } from './lib/scroll'

const INTRO_KEY = 'blessfit:intro'
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function introAlreadySeen() {
  if (prefersReducedMotion()) return true
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [introDone, setIntroDone] = useState(introAlreadySeen)

  useEffect(() => {
    if (prefersReducedMotion()) return
    return initSmoothScroll()
  }, [])

  useEffect(() => {
    if (introDone) return
    lockScroll()
    return unlockScroll
  }, [introDone])

  // links internos (#secao) usam o scroll suave
  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return
      const link = event.target.closest('a[href^="#"]')
      const hash = link?.getAttribute('href')
      if (!hash || hash === '#') return
      const target = document.querySelector(hash)
      if (!target) return
      event.preventDefault()
      scrollToElement(target)
      if (link.classList.contains('skip-link')) target.focus({ preventScroll: true })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // navegação privada: a abertura só volta a aparecer no próximo acesso
    }
    setIntroDone(true)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{!introDone && <Loader key="loader" onDone={finishIntro} />}</AnimatePresence>

      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navbar />

      <main id="conteudo" tabIndex={-1}>
        <Hero ready={introDone} />
        <Marquee />
        <Manifesto />
        <Collection />
        <Details />
        <Features />
        <Verse />
        <Pillars />
        <Community />
        <Faq />
      </main>

      <Footer />
      <WhatsAppFab />
    </MotionConfig>
  )
}
