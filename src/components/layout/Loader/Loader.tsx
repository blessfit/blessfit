import { useEffect } from 'react'
import { Monogram } from '@/components/ui'
import { EASE, EASE_IO } from '@/lib/ease'
import * as S from './Loader.styles'

/** Abertura curta com o monograma b.f — aparece uma vez por sessão. */
export function Loader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1750)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <S.Root aria-hidden="true" exit={{ y: '-100%' }} transition={{ duration: 1.1, ease: EASE_IO }}>
      <S.Inner exit={{ y: '32vh', opacity: 0 }} transition={{ duration: 1.1, ease: EASE_IO }}>
        <S.Circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1, ease: EASE }}>
          <S.Mono
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
          >
            <Monogram />
          </S.Mono>
        </S.Circle>
        <S.Tag
          initial={{ opacity: 0, letterSpacing: '0.2em' }}
          animate={{ opacity: 1, letterSpacing: '0.5em' }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.6 }}
        >
          Faith · Strength · Purpose
        </S.Tag>
      </S.Inner>
    </S.Root>
  )
}
