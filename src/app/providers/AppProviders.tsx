import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { StoreProvider } from '@/store/StoreProvider'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'

/** Providers globais: tema do styled-components, estilos base e estado da loja (sacola e favoritos). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  )
}
