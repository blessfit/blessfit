import { useEffect } from 'react'
import { prefersReducedMotion } from '@/lib/motion'
import { initSmoothScroll, scrollToElement } from '@/lib/scroll'

/** Liga o scroll suave (Lenis) e faz os links internos (#secao) usarem ele. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    return initSmoothScroll()
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      const hash = link?.getAttribute('href')
      if (!link || !hash || hash === '#') return
      const target = document.querySelector<HTMLElement>(hash)
      if (!target) return
      event.preventDefault()
      scrollToElement(target)
      if (link.dataset.skipLink !== undefined) target.focus({ preventScroll: true })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
