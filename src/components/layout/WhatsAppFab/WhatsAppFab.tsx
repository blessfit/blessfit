import { useEffect, useState } from 'react'
import { WhatsApp } from '@/components/ui'
import { external, whatsappUrl } from '@/lib/links'
import * as S from './WhatsAppFab.styles'

/** Botão flutuante de WhatsApp — aparece depois do hero. */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <S.Fab
      href={whatsappUrl()}
      {...external}
      aria-label="Falar com a Blessfit no WhatsApp"
      $visible={visible}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <WhatsApp />
    </S.Fab>
  )
}
