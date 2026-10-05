import type { SVGProps } from 'react'
import { MONOGRAM, WORDMARK, type LogoPath } from './logoPaths'

type LogoProps = Omit<SVGProps<SVGSVGElement>, 'viewBox'> & {
  /** Texto acessível. Sem ele, o logo é tratado como decorativo. */
  title?: string
}

function Mark({ data, title, ...rest }: LogoProps & { data: LogoPath }) {
  const a11y = title
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': true, focusable: 'false' as const }
  return (
    <svg viewBox={`0 0 ${data.width} ${data.height}`} {...a11y} {...rest}>
      <path d={data.d} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

/** Logotipo "blessfit". Passe `title` quando o logo for o único texto do link. */
export const Wordmark = (props: LogoProps) => <Mark data={WORDMARK} {...props} />

/** Monograma "b.f". */
export const Monogram = (props: LogoProps) => <Mark data={MONOGRAM} {...props} />
