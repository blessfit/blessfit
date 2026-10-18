/*
 * Etiqueta do ambiente no topo da tela, para nunca confundir HML com produção.
 * Local: vem do scripts/dev.mjs (APP_ENV). Na Vercel: aparece só nos previews (HML); em produção some.
 */
const LOCAL = process.env.NEXT_PUBLIC_APP_ENV

export function EnvBadge() {
  const label =
    LOCAL === 'production' ? 'PRODUÇÃO · local' : LOCAL === 'hml' ? 'HML · local' : process.env.VERCEL_ENV === 'preview' ? 'HML' : null
  if (!label) return null
  const danger = LOCAL === 'production'

  return (
    <div
      role="status"
      title={danger ? 'Banco de produção: pedidos, clientes e estoque reais' : 'Banco de homologação (blessfit-hml)'}
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        zIndex: 2147483647,
        transform: 'translateX(-50%)',
        padding: '2px 10px',
        borderRadius: '0 0 6px 6px',
        background: danger ? '#c0392b' : '#f5b301',
        color: danger ? '#fff' : '#1c2116',
        font: '700 11px/1.6 system-ui, sans-serif',
        letterSpacing: '0.08em',
        pointerEvents: 'none',
      }}
    >
      {label}
    </div>
  )
}
