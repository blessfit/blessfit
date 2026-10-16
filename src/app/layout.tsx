import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/montserrat/wght.css'
import { StyledRegistry } from './providers/StyledRegistry'

const title = 'Blessfit · Moda fitness'

export const metadata: Metadata = {
  // TODO: trocar pelo domínio oficial quando estiver no ar (vale para as URLs do og:image)
  metadataBase: new URL(process.env.SITE_URL ?? 'https://www.blessfitstore.com.br'),
  title,
  description:
    'Blessfit é moda fitness com conforto, performance e estilo: conjuntos e peças femininas e masculinas. Compre pelo WhatsApp com frete grátis e desconto no Pix.',
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  // Compartilhamento (WhatsApp, Instagram, etc.)
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'blessfit',
    title,
    description: 'Conforto, performance e estilo do treino ao dia a dia.',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      {/* margin 0: sem a margem padrão do navegador (o painel não carrega o GlobalStyle da loja) */}
      <body style={{ margin: 0 }}>
        <StyledRegistry>{children}</StyledRegistry>
      </body>
    </html>
  )
}
