import { AnimatePresence } from 'motion/react'
import { Footer, Loader, Navbar, SkipLink, WhatsAppFab } from '@/components/layout'
import { useIntro } from '@/hooks/useIntro'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import { HomePage } from '@/pages/Home'
import { AppProviders } from './providers/AppProviders'

export default function App() {
  const [introDone, finishIntro] = useIntro()
  useSmoothScroll()

  return (
    <AppProviders>
      <AnimatePresence>{!introDone && <Loader key="loader" onDone={finishIntro} />}</AnimatePresence>

      <SkipLink href="#conteudo" data-skip-link>
        Pular para o conteúdo
      </SkipLink>
      <Navbar />
      <HomePage introDone={introDone} />
      <Footer />
      <WhatsAppFab />
    </AppProviders>
  )
}
