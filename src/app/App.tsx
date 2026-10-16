'use client'

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
import { StorePage } from '@/views/Store'
import type { LiveCatalog } from '@/data/live'
import { AppProviders } from './providers/AppProviders'

/** A loja inteira. `live`: preços e estoque do painel, lidos no servidor (null = valores do catálogo). */
export default function App({ live }: { live: LiveCatalog | null }) {
  return (
    <AppProviders live={live}>
      <div id="top" />
      <SkipLink href="#conteudo">Pular para o conteúdo</SkipLink>
      <AnnouncementBar />
      <Header />
      <StorePage />
      <SiteFooter />
      <WhatsAppFab />

      {/* janelas: visualizar produto, sacola/menu e páginas de ajuda */}
      <QuickView />
      <Panels />
      <InfoDialog />
    </AppProviders>
  )
}
