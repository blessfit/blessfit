import { MotionConfig } from 'motion/react'
import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'

/** Providers globais: tema do styled-components, estilos base e preferências de animação. */
export function AppProviders({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  )
}
