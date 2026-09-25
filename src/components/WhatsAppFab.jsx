import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { EASE } from '../lib/ease'
import { external, whatsappUrl } from '../lib/links'
import { WhatsApp } from './Icons'
import './WhatsAppFab.css'

/** Botão flutuante de WhatsApp — aparece depois do hero. */
export function WhatsAppFab() {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => setVisible(y > 640))

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          className="fab"
          href={whatsappUrl()}
          {...external}
          aria-label="Falar com a blessfit no WhatsApp"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <WhatsApp />
        </motion.a>
      )}
    </AnimatePresence>
  )
}
