import {
  motion,
  useInView,
  useReducedMotion,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from 'motion/react'
import { Fragment, useRef, type ReactNode } from 'react'
import { EASE } from '@/lib/ease'
import * as S from './Reveal.styles'

/**
 * Surge suavemente (fade + subida) quando entra na tela.
 * `tag` define o elemento (div, li, article...). Aceita `className`, então pode ser estendido com styled().
 */
type RevealTag = 'div' | 'li' | 'article'

export type RevealProps = Omit<HTMLMotionProps<'div'>, 'ref'> & {
  tag?: RevealTag
  delay?: number
  /** Deslocamento inicial (px) antes de subir. */
  y?: number
}

export function Reveal({ tag = 'div', delay = 0, y = 36, className, children, ...rest }: RevealProps) {
  // as três tags compartilham as mesmas props de HTMLElement que usamos aqui
  const Tag = motion[tag] as typeof motion.div
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/**
 * Parágrafo que sobe palavra por palavra ao entrar na tela.
 * Palavras entre *asteriscos* ganham destaque em caligrafia.
 */
type SplitRevealProps = {
  text: string
  className?: string
  delay?: number
  stagger?: number
}

export function SplitReveal({ text, className, delay = 0, stagger = 0.022 }: SplitRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const words = text.split(' ')

  return (
    <p ref={ref} className={className}>
      {words.map((raw, i) => {
        const accent = raw.startsWith('*')
        const word = raw.replaceAll('*', '')
        const from = accent ? { opacity: 0, y: '45%' } : { y: '108%' }
        const to = accent ? { opacity: 1, y: '0%' } : { y: '0%' }
        return (
          <Fragment key={i}>
            <S.Word $accent={accent}>
              <S.WordInner
                initial={from}
                animate={inView ? to : undefined}
                transition={{ duration: accent ? 1.3 : 0.95, ease: EASE, delay: delay + i * stagger }}
              >
                {word}
              </S.WordInner>
            </S.Word>{' '}
          </Fragment>
        )
      })}
    </p>
  )
}

/**
 * Texto que "acende" palavra por palavra conforme o scroll (progress 0 → 1).
 * `segments` = [{ t: 'texto', em: true|false }]
 */
export type LitSegment = { t: string; em?: boolean }

type ScrollLitTextProps = {
  segments: readonly LitSegment[]
  progress: MotionValue<number>
  range?: [number, number]
  className?: string
}

export function ScrollLitText({ segments, progress, range = [0, 1], className }: ScrollLitTextProps) {
  const reduce = useReducedMotion()
  const words = segments.flatMap((s) => s.t.split(' ').map((w) => ({ w, em: Boolean(s.em) })))
  const [start, end] = range
  const step = (end - start) / words.length

  return (
    <p className={className}>
      {words.map((item, i) => (
        <Fragment key={i}>
          {reduce ? (
            <S.LitWord $em={item.em}>{item.w}</S.LitWord>
          ) : (
            <LitWord
              progress={progress}
              from={start + i * step}
              to={Math.min(end, start + (i + 2) * step)}
              em={item.em}
            >
              {item.w}
            </LitWord>
          )}{' '}
        </Fragment>
      ))}
    </p>
  )
}

const DIM = 0.13

type LitWordProps = {
  progress: MotionValue<number>
  from: number
  to: number
  em: boolean
  children: ReactNode
}

function LitWord({ progress, from, to, em, children }: LitWordProps) {
  // Intervalo sempre de 0 a 1: com a aceleração via ScrollTimeline, um intervalo parcial
  // faz a opacidade voltar ao valor inicial depois do fim da faixa.
  const opacity = useTransform(progress, [0, from, to, 1], [DIM, DIM, 1, 1])
  return (
    <S.LitWord $em={em} style={{ opacity }}>
      {children}
    </S.LitWord>
  )
}
