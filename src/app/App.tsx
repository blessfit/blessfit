import {
  AnnouncementBar,
  Header,
  InfoDialog,
  Panels,
  SiteFooter,
  SkipLink,
  WhatsAppFab,
} from '@/components/layout'
import { QuickView } from '@/components/product'
import { StorePage } from '@/pages/Store'
import { AppProviders } from './providers/AppProviders'

export default function App() {
  return (
    <AppProviders>
      <div id="top" />
      <SkipLink href="#conteudo">Pular para o conteúdo</SkipLink>
      <AnnouncementBar />
      <Header />
      <StorePage />
      <SiteFooter />
      <WhatsAppFab />

      {/* janelas: visualizar produto, sacola/favoritos/menu e páginas de ajuda */}
      <QuickView />
      <Panels />
      <InfoDialog />
    </AppProviders>
  )
}
