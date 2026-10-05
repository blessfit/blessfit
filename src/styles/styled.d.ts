import 'styled-components'
import type { Theme } from './theme'

// Tipa o `theme` recebido pelos styled-components (props.theme / useTheme)
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
