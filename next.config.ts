import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // nomes de classe legíveis e estilos renderizados no servidor para o styled-components
  compiler: { styledComponents: true },
}

export default nextConfig
