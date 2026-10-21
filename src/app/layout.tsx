import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/montserrat/wght.css'
import { SHOP } from '@/data/shop'
import { SITE_URL } from '@/lib/site'
import { EnvBadge } from './EnvBadge'
import { StyledRegistry } from './providers/StyledRegistry'

const title = 'Blessfit Store · Moda fitness'

// Diz ao Google o nome da loja e as grafias que as pessoas buscam ("blessfitstore", "blessfit store"...).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Blessfit Store',
      alternateName: ['blessfitstore', 'Blessfit', 'BlessFit Store'],
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'ClothingStore',
      '@id': `${SITE_URL}/#store`,
      name: 'Blessfit Store',
      alternateName: 'blessfitstore',
      legalName: SHOP.company.legalName,
      url: SITE_URL,
      logo: `${SITE_URL}/apple-touch-icon.png`,
      image: `${SITE_URL}/og.jpg`,
      email: SHOP.email,
      telephone: `+${SHOP.whatsapp}`,
      sameAs: [`https://www.instagram.com/${SHOP.instagram}/`],
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description:
    'Blessfit Store (blessfitstore) é moda fitness com conforto, performance e estilo: conjuntos e peças femininas e masculinas. Compre pelo WhatsApp com frete grátis e desconto no Pix.',
  applicationName: 'Blessfit Store',
  // O Google mostra o ícone redondo ao lado do nome na busca: precisa de um PNG/ICO em múltiplo de 48px
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  // Código da verificação por meta tag do Google Search Console (opcional: a verificação por DNS dispensa)
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  // Compartilhamento (WhatsApp, Instagram, etc.)
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Blessfit Store',
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      {/* margin 0: sem a margem padrão do navegador (o painel não carrega o GlobalStyle da loja) */}
      <body style={{ margin: 0 }}>
        <EnvBadge />
        <StyledRegistry>{children}</StyledRegistry>
      </body>
    </html>
  )
}
