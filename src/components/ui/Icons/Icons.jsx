// Ícones de traço fino, no mesmo estilo dos ícones das peças de divulgação.

function Svg({ children, className, strokeWidth = 1.3 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

export const ArrowRight = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M4 12h16" />
    <path d="m14 6 6 6-6 6" />
  </Svg>
)

export const ArrowUpRight = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Svg>
)

export const Plus = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
)

export const Instagram = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.7" r="0.5" fill="currentColor" />
  </Svg>
)

export const WhatsApp = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
)

/** Estrela de quatro pontas usada como separador. */
export const Star = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="currentColor">
    <path d="M12 1.5c.7 6.6 3.9 9.8 10.5 10.5-6.6.7-9.8 3.9-10.5 10.5-.7-6.6-3.9-9.8-10.5-10.5C8.1 11.3 11.3 8.1 12 1.5Z" />
  </svg>
)

// Ícones de tecnologia — pathLength=1 permite a animação de "desenho" do traço.
const L = { pathLength: 1 }

export const FeatherIcon = (p) => (
  <Svg {...p}>
    <path {...L} d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <path {...L} d="M16 8 2 22" />
    <path {...L} d="M17.5 15H9" />
  </Svg>
)

export const DropIcon = (p) => (
  <Svg {...p}>
    <path {...L} d="m12 2.7 5.66 5.66a8 8 0 1 1-11.32 0z" />
    <path {...L} d="M8.6 14.2a3.6 3.6 0 0 0 3 3.3" />
  </Svg>
)

export const StretchIcon = (p) => (
  <Svg {...p}>
    <path {...L} d="M3.5 9.5c5-3.2 12-3.2 17 0" />
    <path {...L} d="M3.5 14.5c5 3.2 12 3.2 17 0" />
    <path {...L} d="M6.4 7.2 3.5 9.5l3.4.9" />
    <path {...L} d="m17.6 7.2 2.9 2.3-3.4.9" />
    <path {...L} d="m6.4 16.8-2.9-2.3 3.4-.9" />
    <path {...L} d="m17.6 16.8 2.9-2.3-3.4-.9" />
  </Svg>
)

export const WavesIcon = (p) => (
  <Svg {...p}>
    <path {...L} d="M7 20c-2-2.5 2-4.5 0-7s2-4.5 0-7" />
    <path {...L} d="M12 20c-2-2.5 2-4.5 0-7s2-4.5 0-7" />
    <path {...L} d="M17 20c-2-2.5 2-4.5 0-7s2-4.5 0-7" />
  </Svg>
)

export const DiamondIcon = (p) => (
  <Svg {...p}>
    <path {...L} d="M6 3.5h12L22 9 12 20.5 2 9z" />
    <path {...L} d="M2 9h20" />
    <path {...L} d="M9.5 3.5 8 9l4 11.5" />
    <path {...L} d="M14.5 3.5 16 9l-4 11.5" />
  </Svg>
)

export const DumbbellIcon = (p) => (
  <Svg {...p}>
    <rect {...L} x="5" y="6" width="3" height="12" rx="1" />
    <rect {...L} x="16" y="6" width="3" height="12" rx="1" />
    <rect {...L} x="2" y="9" width="3" height="6" rx="1" />
    <rect {...L} x="19" y="9" width="3" height="6" rx="1" />
    <path {...L} d="M8 12h8" />
  </Svg>
)
