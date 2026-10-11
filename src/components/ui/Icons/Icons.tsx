import type { ReactNode } from 'react'

// Ícones de traço fino, no mesmo estilo dos ícones das peças de divulgação.

export type IconProps = { className?: string }

/** Componente de ícone (aceito por props como `glyph`/`icon` do Button). */
export type IconComponent = (props: IconProps) => ReactNode

type SvgProps = IconProps & { children: ReactNode; strokeWidth?: number }

function Svg({ children, className, strokeWidth = 1.3 }: SvgProps) {
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

export const ArrowRight: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M4 12h16" />
    <path d="m14 6 6 6-6 6" />
  </Svg>
)

export const ArrowUpRight: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Svg>
)

export const Plus: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
)

export const Instagram: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.7" r="0.5" fill="currentColor" />
  </Svg>
)

export const WhatsApp: IconComponent = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
)

/** Estrela de quatro pontas usada como separador. */
export const Star: IconComponent = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="currentColor">
    <path d="M12 1.5c.7 6.6 3.9 9.8 10.5 10.5-6.6.7-9.8 3.9-10.5 10.5-.7-6.6-3.9-9.8-10.5-10.5C8.1 11.3 11.3 8.1 12 1.5Z" />
  </svg>
)

// Ícones de tecnologia — pathLength=1 permite a animação de "desenho" do traço.
const L = { pathLength: 1 } as const

export const FeatherIcon: IconComponent = (p) => (
  <Svg {...p}>
    <path {...L} d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <path {...L} d="M16 8 2 22" />
    <path {...L} d="M17.5 15H9" />
  </Svg>
)

export const DropIcon: IconComponent = (p) => (
  <Svg {...p}>
    <path {...L} d="m12 2.7 5.66 5.66a8 8 0 1 1-11.32 0z" />
    <path {...L} d="M8.6 14.2a3.6 3.6 0 0 0 3 3.3" />
  </Svg>
)

export const StretchIcon: IconComponent = (p) => (
  <Svg {...p}>
    <path {...L} d="M3.5 9.5c5-3.2 12-3.2 17 0" />
    <path {...L} d="M3.5 14.5c5 3.2 12 3.2 17 0" />
    <path {...L} d="M6.4 7.2 3.5 9.5l3.4.9" />
    <path {...L} d="m17.6 7.2 2.9 2.3-3.4.9" />
    <path {...L} d="m6.4 16.8-2.9-2.3 3.4-.9" />
    <path {...L} d="m17.6 16.8 2.9-2.3-3.4-.9" />
  </Svg>
)

export const WavesIcon: IconComponent = (p) => (
  <Svg {...p}>
    <path {...L} d="M7 20c-2-2.5 2-4.5 0-7s2-4.5 0-7" />
    <path {...L} d="M12 20c-2-2.5 2-4.5 0-7s2-4.5 0-7" />
    <path {...L} d="M17 20c-2-2.5 2-4.5 0-7s2-4.5 0-7" />
  </Svg>
)

export const DiamondIcon: IconComponent = (p) => (
  <Svg {...p}>
    <path {...L} d="M6 3.5h12L22 9 12 20.5 2 9z" />
    <path {...L} d="M2 9h20" />
    <path {...L} d="M9.5 3.5 8 9l4 11.5" />
    <path {...L} d="M14.5 3.5 16 9l-4 11.5" />
  </Svg>
)

export const DumbbellIcon: IconComponent = (p) => (
  <Svg {...p}>
    <rect {...L} x="5" y="6" width="3" height="12" rx="1" />
    <rect {...L} x="16" y="6" width="3" height="12" rx="1" />
    <rect {...L} x="2" y="9" width="3" height="6" rx="1" />
    <rect {...L} x="19" y="9" width="3" height="6" rx="1" />
    <path {...L} d="M8 12h8" />
  </Svg>
)

// Ícones da loja (header, cards, sacola e rodapé).

export const Search: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.6}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </Svg>
)

export const Heart: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.6}>
    <path d="M12 20.3s-7.5-4.6-9.2-9.2C1.6 7.8 3.8 4.5 7.2 4.5c2 0 3.6 1.2 4.8 2.9 1.2-1.7 2.8-2.9 4.8-2.9 3.4 0 5.6 3.3 4.4 6.6-1.7 4.6-9.2 9.2-9.2 9.2Z" />
  </Svg>
)

export const HeartFilled: IconComponent = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="currentColor">
    <path d="M12 20.3s-7.5-4.6-9.2-9.2C1.6 7.8 3.8 4.5 7.2 4.5c2 0 3.6 1.2 4.8 2.9 1.2-1.7 2.8-2.9 4.8-2.9 3.4 0 5.6 3.3 4.4 6.6-1.7 4.6-9.2 9.2-9.2 9.2Z" />
  </svg>
)

export const User: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.6}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20.5c1.3-3.6 4.3-5.5 8-5.5s6.7 1.9 8 5.5" />
  </Svg>
)

export const Bag: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.6}>
    <path d="M5 8h14l-1 12.5H6z" />
    <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
  </Svg>
)

export const ChevronLeft: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.8}>
    <path d="m15 5-7 7 7 7" />
  </Svg>
)

export const ChevronRight: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.8}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
)

export const Menu: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.7}>
    <path d="M3.5 7h17" />
    <path d="M3.5 12h17" />
    <path d="M3.5 17h11" />
  </Svg>
)

export const Close: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.7}>
    <path d="m6 6 12 12" />
    <path d="M18 6 6 18" />
  </Svg>
)

export const Eye: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.6}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

export const Minus: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.6}>
    <path d="M5 12h14" />
  </Svg>
)

export const Truck: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M2.5 6.5h11v10h-11z" />
    <path d="M13.5 9.5h4l3 3.5v3.5h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </Svg>
)

export const CreditCard: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 9.5h19" />
    <path d="M6 15h4" />
  </Svg>
)

export const Repeat: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H19" />
    <path d="m16 3 3 3-3 3" />
    <path d="M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H5" />
    <path d="m8 21-3-3 3-3" />
  </Svg>
)

export const Ruler: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="m3 16.5 13.5-13.5 4.5 4.5L7.5 21z" />
    <path d="m7 12.5 2 2" />
    <path d="m10 9.5 2 2" />
    <path d="m13 6.5 2 2" />
  </Svg>
)

export const StarFilled: IconComponent = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="currentColor">
    <path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
  </svg>
)

export const Check: IconComponent = (p) => (
  <Svg {...p} strokeWidth={1.8}>
    <path d="m4.5 12.5 4.5 4.5 10.5-10.5" />
  </Svg>
)
