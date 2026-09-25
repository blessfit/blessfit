import Lenis from 'lenis'

let lenis = null
let locks = 0

/** Liga o scroll suave (Lenis). Retorna a função de limpeza. */
export function initSmoothScroll() {
  lenis = new Lenis({ autoRaf: true, lerp: 0.09, touchMultiplier: 1.4 })
  if (locks > 0) lenis.stop()
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToElement(el) {
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.5, force: true })
    return
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

/** Travas empilháveis: loader e menu mobile podem travar o scroll ao mesmo tempo. */
export function lockScroll() {
  locks += 1
  if (locks === 1) {
    lenis?.stop()
    document.documentElement.classList.add('is-locked')
  }
}

export function unlockScroll() {
  if (locks === 0) return
  locks -= 1
  if (locks === 0) {
    lenis?.start()
    document.documentElement.classList.remove('is-locked')
  }
}
