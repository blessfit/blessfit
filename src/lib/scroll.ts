import Lenis from 'lenis'
import { prefersReducedMotion } from './motion'

let lenis: Lenis | null = null
let locks = 0

/** Liga o scroll suave (Lenis). Retorna a função de limpeza. */
export function initSmoothScroll(): () => void {
  lenis = new Lenis({ autoRaf: true, lerp: 0.09, touchMultiplier: 1.4 })
  if (locks > 0) lenis.stop()
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToElement(el: HTMLElement): void {
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.5, force: true })
    return
  }
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}

/** Travas empilháveis: loader e menu mobile podem travar o scroll ao mesmo tempo. */
export function lockScroll(): void {
  locks += 1
  if (locks === 1) {
    lenis?.stop()
    document.documentElement.classList.add('is-locked')
  }
}

export function unlockScroll(): void {
  if (locks === 0) return
  locks -= 1
  if (locks === 0) {
    lenis?.start()
    document.documentElement.classList.remove('is-locked')
  }
}
