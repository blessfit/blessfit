import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // nomes de classe legíveis e estilos renderizados no servidor para o styled-components
  compiler: { styledComponents: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // ninguém pode abrir o site (e o painel) dentro de um iframe de outro site (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // o id do pedido vai na URL (/?pedido=…): não repassar o endereço completo para outros sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
