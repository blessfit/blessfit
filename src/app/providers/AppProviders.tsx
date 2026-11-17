import { useMemo, type ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { isBlackFriday, NO_CAMPAIGN, type Campaign } from '@/lib/campaign'
import type { LiveCatalog } from '@/data/live'
import { CampaignContext } from '@/store/campaignContext'
import { CatalogProvider } from '@/store/CatalogProvider'
import { StoreProvider } from '@/store/StoreProvider'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'

/**
 * Providers globais: tema do styled-components, estilos base, campanha (Black Friday ligada no painel),
 * catálogo com preços e estoque do painel e estado da loja (sacola).
 */
export function AppProviders({
  live,
  campaign = NO_CAMPAIGN,
  children,
}: {
  live: LiveCatalog | null
  campaign?: Campaign
  children: ReactNode
}) {
  const state = useMemo(() => ({ ...campaign, active: isBlackFriday(campaign) }), [campaign])

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle $blackFriday={state.active} />
      <CampaignContext.Provider value={state}>
        <CatalogProvider live={live}>
          <StoreProvider>{children}</StoreProvider>
        </CatalogProvider>
      </CampaignContext.Provider>
    </ThemeProvider>
  )
}
