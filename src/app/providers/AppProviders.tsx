import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import type { LiveCatalog } from '@/data/live'
import { CatalogProvider } from '@/store/CatalogProvider'
import { StoreProvider } from '@/store/StoreProvider'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'

/** Providers globais: tema do styled-components, estilos base, catálogo com preços e estoque do painel e estado da loja (sacola e favoritos). */
export function AppProviders({ live, children }: { live: LiveCatalog | null; children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <CatalogProvider live={live}>
        <StoreProvider>{children}</StoreProvider>
      </CatalogProvider>
    </ThemeProvider>
  )
}
