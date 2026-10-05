import { useCallback, useEffect, useState } from 'react'
import { lockScroll, unlockScroll } from '@/lib/scroll'
import { prefersReducedMotion } from '@/lib/motion'

const INTRO_KEY = 'blessfit:intro'

function introAlreadySeen() {
  if (prefersReducedMotion()) return true
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Controla a abertura (Loader): aparece uma vez por sessão e trava o scroll enquanto está na tela.
 * Retorna `[introDone, finishIntro]`.
 */
export function useIntro(): [introDone: boolean, finishIntro: () => void] {
  const [introDone, setIntroDone] = useState(introAlreadySeen)

  useEffect(() => {
    if (introDone) return
    lockScroll()
    return unlockScroll
  }, [introDone])

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // navegação privada: a abertura só volta a aparecer no próximo acesso
    }
    setIntroDone(true)
  }, [])

  return [introDone, finishIntro]
}
