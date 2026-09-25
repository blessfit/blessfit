import { motion } from 'motion/react'
import { useEffect } from 'react'
import { EASE, EASE_IO } from '../lib/ease'
import { Monogram } from './Logo'
import './Loader.css'

/** Abertura curta com o monograma b.f — aparece uma vez por sessão. */
export function Loader({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1750)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      className="loader"
      aria-hidden="true"
      exit={{ y: '-100%' }}
      transition={{ duration: 1.1, ease: EASE_IO }}
    >
      <motion.div
        className="loader__inner"
        exit={{ y: '32vh', opacity: 0 }}
        transition={{ duration: 1.1, ease: EASE_IO }}
      >
        <motion.div
          className="loader__circle"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <motion.span
            className="loader__mono"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
          >
            <Monogram />
          </motion.span>
        </motion.div>
        <motion.p
          className="loader__tag"
          initial={{ opacity: 0, letterSpacing: '0.2em' }}
          animate={{ opacity: 1, letterSpacing: '0.5em' }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.6 }}
        >
          Faith · Strength · Purpose
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
