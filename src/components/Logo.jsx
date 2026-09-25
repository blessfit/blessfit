import { MONOGRAM, WORDMARK } from './logoPaths'

function Mark({ data, title, className, ...rest }) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true, focusable: 'false' }
  return (
    <svg viewBox={`0 0 ${data.width} ${data.height}`} className={className} {...a11y} {...rest}>
      <path d={data.d} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

/** Logotipo "blessfit". Passe `title` quando o logo for o único texto do link. */
export const Wordmark = (props) => <Mark data={WORDMARK} {...props} />

/** Monograma "b.f". */
export const Monogram = (props) => <Mark data={MONOGRAM} {...props} />
