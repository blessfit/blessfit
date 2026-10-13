'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

/** Coleta os estilos do styled-components no servidor e os envia junto com o HTML (sem “piscar” sem estilo). */
export function StyledRegistry({ children }: { children: ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement()
    sheet.instance.clearTag()
    return <>{styles}</>
  })

  if (typeof window !== 'undefined') return <>{children}</>
  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>
}
