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
import type { Campaign } from '@/lib/campaign'
import { AppProviders } from './providers/AppProviders'

/**
 * A loja inteira. `live`: preços e estoque do painel, lidos no servidor (null = valores do catálogo).
 * `campaign`: Black Friday ligada ou não em /admin/campanha.
 */
export default function App({ live, campaign }: { live: LiveCatalog | null; campaign: Campaign }) {
  return (
    <AppProviders live={live} campaign={campaign}>
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
