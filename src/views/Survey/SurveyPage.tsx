'use client'

/*
 * Pesquisa “Próximas peças” (/proximas-pecas): abertura, 4 etapas e o cupom no fim.
 * O rascunho fica no navegador: quem fecha o WhatsApp no meio continua de onde parou.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { Wordmark } from '@/components/ui/Logo'
import type { Size } from '@/data/catalog'
import {
  CONSENT_TEXT,
  piecesFor,
  SURVEY,
  SURVEY_ACTIVITIES,
  SURVEY_COLORS_NEW,
  SURVEY_COLORS_NOW,
  SURVEY_PATTERNS,
  SURVEY_PRICES,
  SURVEY_SIZES,
  SURVEY_WHO,
  type SurveyAnswers,
  type SurveyColor,
  type Who,
} from '@/data/survey'
import { SITE_URL } from '@/lib/site'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'
import * as S from './Survey.styles'

const STORAGE_KEY = `blessfit:survey:${SURVEY.campaign}`
const STEPS = 4

const EMPTY: SurveyAnswers = {
  campaign: SURVEY.campaign,
  who: '' as Who,
  pieces: [],
  colors: [],
  otherColor: '',
  pattern: '',
  size: '',
  price: '',
  activities: [],
  contact: { name: '', phone: '', email: '' },
  consent: false,
  website: '',
}

type Draft = { step: number; answers: SurveyAnswers; sent?: boolean }

function load(): Draft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as Draft
    return { ...draft, answers: { ...EMPTY, ...draft.answers, contact: { ...EMPTY.contact, ...draft.answers?.contact } } }
  } catch {
    return null
  }
}

function save(draft: Draft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // modo privado ou armazenamento cheio: segue sem rascunho
  }
}

// ——— Ícones (traço, herdam a cor do texto) ———
const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const CheckIcon = () => (
  <Svg>
    <path d="M5 12l5 5L20 7" />
  </Svg>
)
const ClockIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
)
const GiftIcon = () => (
  <Svg>
    <path d="M20 12v8H4v-8M2 7h20v5H2zM12 20V7" />
    <path d="M12 7c-2-4-6-3-6-1s3 1 6 1c3 0 6 1 6-1s-4-3-6 1" />
  </Svg>
)
const SendIcon = () => (
  <Svg>
    <path d="M22 2 11 13M22 2 15 22l-4-9-9-4z" />
  </Svg>
)
const HangerIcon = () => (
  <Svg>
    <path d="M12 6a2 2 0 1 1 2-2" />
    <path d="M12 6v1L3 14c-1 .8-.5 2 .7 2h16.6c1.2 0 1.7-1.2.7-2l-9-7" />
  </Svg>
)

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 160
}

const phoneOk = (v: string) => {
  let d = v.replace(/\D/g, '')
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2)
  return /^[1-9]{2}9?\d{8}$/.test(d)
}
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

/** O que falta na etapa, ou null se ela está completa. */
function missing(step: number, a: SurveyAnswers): Record<string, string> | null {
  const e: Record<string, string> = {}
  if (step === 1) {
    if (!a.who) e.who = 'Escolha para quem são as peças'
    if (!a.pieces.length) e.pieces = 'Escolha pelo menos uma peça'
  }
  if (step === 2) {
    if (!a.colors.length) e.colors = 'Escolha pelo menos uma cor'
    if (!a.pattern) e.pattern = 'Escolha uma opção'
  }
  if (step === 3) {
    if (!a.size) e.size = 'Escolha o seu tamanho'
    if (!a.price) e.price = 'Escolha uma faixa de preço'
  }
  if (step === 4) {
    const { phone, email } = a.contact
    if (phone.trim() && !phoneOk(phone)) e.phone = 'Confira o WhatsApp: DDD + número'
    if (email.trim() && !emailOk(email)) e.email = 'Confira o e-mail'
    if ((phone.trim() || email.trim()) && !a.consent) e.consent = 'Para receber avisos, marque a autorização'
  }
  return Object.keys(e).length ? e : null
}

export function SurveyPage({ closed }: { closed: boolean }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <S.Page>
        <S.Card>{closed ? <Closed /> : <Survey />}</S.Card>
      </S.Page>
    </ThemeProvider>
  )
}

function Closed() {
  return (
    <S.Done>
      <h1>Pesquisa encerrada</h1>
      <p>Obrigada pelo interesse! As respostas já estão ajudando a montar a próxima coleção.</p>
      <S.LinkButton href={SITE_URL}>Ver a loja</S.LinkButton>
    </S.Done>
  )
}

function Survey() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<SurveyAnswers>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [ready, setReady] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)

  // rascunho: lê uma vez (só no navegador), depois grava a cada mudança
  useEffect(() => {
    const draft = load()
    if (draft) {
      setAnswers(draft.answers)
      setStep(draft.sent ? STEPS + 1 : Math.min(Math.max(draft.step, 0), STEPS))
    }
    setReady(true)
  }, [])
  useEffect(() => {
    // depois do envio, guarda só que já respondeu: nome e contato não ficam no aparelho
    if (ready) save(step > STEPS ? { step, answers: EMPTY, sent: true } : { step, answers })
  }, [ready, step, answers])

  // a cada etapa, o foco vai para o título (leitores de tela anunciam a pergunta nova)
  useEffect(() => {
    if (!ready) return
    window.scrollTo({ top: 0 })
    if (step > 0) heading.current?.focus()
  }, [step, ready])

  const clearError = (...keys: string[]) =>
    setErrors((e) => {
      const next = { ...e }
      for (const key of keys) delete next[key]
      return next
    })
  const set = (patch: Partial<SurveyAnswers>) => {
    setAnswers((a) => ({ ...a, ...patch }))
    clearError(...Object.keys(patch))
  }
  const toggle = (key: 'pieces' | 'colors' | 'activities', id: string) => {
    const list = answers[key]
    if (list.includes(id)) return set({ [key]: list.filter((x) => x !== id) })
    if (key === 'colors' && list.length >= SURVEY.maxColors) {
      return setErrors((e) => ({ ...e, colors: `Escolha até ${SURVEY.maxColors} cores` }))
    }
    set({ [key]: [...list, id] })
  }
  const pickWho = (who: Who) => {
    const allowed = piecesFor(who).map((p) => p.id)
    set({ who, pieces: answers.pieces.filter((id) => allowed.includes(id)) })
  }

  const next = async () => {
    const problems = missing(step, answers)
    if (problems) {
      setErrors(problems)
      return
    }
    if (step < STEPS) return setStep(step + 1)

    setSending(true)
    setSendError('')
    try {
      const res = await fetch('/api/proximas-pecas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(body.error ?? 'Não foi possível enviar agora. Tente de novo em instantes.')
      setStep(STEPS + 1)
    } catch (err) {
      setSendError(err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Sem conexão. Confira a internet e tente de novo.')
    } finally {
      setSending(false)
    }
  }

  if (step === 0) return <Intro onStart={() => setStep(1)} />
  if (step > STEPS) return <Thanks />

  const error = (key: string) => errors[key] && <S.Error role="alert">{errors[key]}</S.Error>
  const titleRef = (first: boolean) => (first ? { ref: heading, tabIndex: -1 } : {})

  return (
    <>
      <S.Top>
        <div>
          <Wordmark />
          <span aria-live="polite">
            Etapa {step} de {STEPS}
          </span>
        </div>
        <S.Progress $value={(step / STEPS) * 100} role="progressbar" aria-valuemin={0} aria-valuemax={STEPS} aria-valuenow={step} aria-label="Progresso" />
      </S.Top>

      <S.Body>
        {step === 1 && (
          <>
            <S.Question>
              <legend>
                <S.Heading {...titleRef(true)}>As peças são para quem?</S.Heading>
              </legend>
              <S.Grid $cols={3}>
                {SURVEY_WHO.map((w) => (
                  <S.Choice key={w.id} type="button" aria-pressed={answers.who === w.id} onClick={() => pickWho(w.id)}>
                    {w.label}
                  </S.Choice>
                ))}
              </S.Grid>
              {error('who')}
            </S.Question>

            {answers.who && (
              <S.Question>
                <legend>
                  <S.Heading>Quais peças você compraria?</S.Heading>
                  <S.Hint>Marque quantas quiser.</S.Hint>
                </legend>
                <S.Grid $cols={2}>
                  {piecesFor(answers.who).map((p) => {
                    const on = answers.pieces.includes(p.id)
                    return (
                      <S.PieceCard key={p.id} type="button" aria-pressed={on} onClick={() => toggle('pieces', p.id)}>
                        <S.PieceImage>
                          {p.image ? <img src={p.image} alt="" loading="lazy" /> : <HangerIcon />}
                          {p.isNew && <S.NewTag>NOVA</S.NewTag>}
                          {on && (
                            <S.Tick>
                              <CheckIcon />
                            </S.Tick>
                          )}
                        </S.PieceImage>
                        <S.PieceName>{p.label}</S.PieceName>
                      </S.PieceCard>
                    )
                  })}
                </S.Grid>
                {error('pieces')}
              </S.Question>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <S.Question>
              <legend>
                <S.Heading {...titleRef(true)}>Quais cores você usaria?</S.Heading>
                <S.Hint>Escolha até {SURVEY.maxColors}.</S.Hint>
              </legend>
              <S.Group>Cores da loja hoje</S.Group>
              <Swatches colors={SURVEY_COLORS_NOW} selected={answers.colors} onToggle={(id) => toggle('colors', id)} />
              <S.Group data-new="">Novas ideias</S.Group>
              <Swatches colors={SURVEY_COLORS_NEW} selected={answers.colors} onToggle={(id) => toggle('colors', id)} />
              {error('colors')}
              <S.Field>
                Outra cor que você gostaria?
                <input
                  type="text"
                  maxLength={40}
                  placeholder="Ex.: verde água"
                  value={answers.otherColor}
                  onChange={(e) => set({ otherColor: e.target.value })}
                />
              </S.Field>
            </S.Question>

            <S.Question>
              <legend>
                <S.Heading>Liso ou estampado?</S.Heading>
              </legend>
              <S.Grid $cols={3} role="radiogroup">
                {SURVEY_PATTERNS.map((p) => (
                  <S.Choice key={p.id} type="button" role="radio" aria-checked={answers.pattern === p.id} onClick={() => set({ pattern: p.id })}>
                    {p.label}
                  </S.Choice>
                ))}
              </S.Grid>
              {error('pattern')}
            </S.Question>
          </>
        )}

        {step === 3 && (
          <>
            <S.Question>
              <legend>
                <S.Heading {...titleRef(true)}>Qual o seu tamanho?</S.Heading>
              </legend>
              <S.Grid $cols={5} role="radiogroup">
                {SURVEY_SIZES.map((size) => (
                  <S.Choice key={size} type="button" role="radio" aria-checked={answers.size === size} onClick={() => set({ size: size as Size })}>
                    {size}
                  </S.Choice>
                ))}
              </S.Grid>
              {error('size')}
            </S.Question>

            <S.Question>
              <legend>
                <S.Heading>Quanto pagaria por um conjunto?</S.Heading>
              </legend>
              <S.Grid $cols={1} role="radiogroup">
                {SURVEY_PRICES.map((p) => (
                  <S.Radio key={p.id} type="button" role="radio" aria-checked={answers.price === p.id} onClick={() => set({ price: p.id })}>
                    {p.label}
                  </S.Radio>
                ))}
              </S.Grid>
              {error('price')}
            </S.Question>

            <S.Question>
              <legend>
                <S.Heading>Para qual atividade?</S.Heading>
                <S.Hint>Opcional. Marque quantas quiser.</S.Hint>
              </legend>
              <S.Wrap>
                {SURVEY_ACTIVITIES.map((a) => (
                  <S.Choice key={a.id} type="button" $round aria-pressed={answers.activities.includes(a.id)} onClick={() => toggle('activities', a.id)}>
                    {a.label}
                  </S.Choice>
                ))}
              </S.Wrap>
            </S.Question>
          </>
        )}

        {step === 4 && (
          <S.Question>
            <legend>
              <S.Heading {...titleRef(true)}>Quer ser avisada quando lançar?</S.Heading>
              <S.Hint>Opcional. Avisamos quando as peças que você marcou chegarem na loja.</S.Hint>
            </legend>
            <S.Field>
              Nome
              <input
                type="text"
                autoComplete="given-name"
                maxLength={60}
                placeholder="Como podemos te chamar?"
                value={answers.contact.name}
                onChange={(e) => set({ contact: { ...answers.contact, name: e.target.value } })}
              />
            </S.Field>
            <S.Field>
              WhatsApp
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={30}
                placeholder="(00) 00000-0000"
                value={answers.contact.phone}
                aria-invalid={Boolean(errors.phone)}
                onChange={(e) => {
                  set({ contact: { ...answers.contact, phone: e.target.value } })
                  clearError('phone')
                }}
              />
            </S.Field>
            {error('phone')}
            <S.Field>
              E-mail
              <input
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="voce@email.com"
                value={answers.contact.email}
                aria-invalid={Boolean(errors.email)}
                onChange={(e) => {
                  set({ contact: { ...answers.contact, email: e.target.value } })
                  clearError('email')
                }}
              />
            </S.Field>
            {error('email')}
            <S.Consent>
              <input type="checkbox" checked={answers.consent} onChange={(e) => set({ consent: e.target.checked })} />
              <span>{CONSENT_TEXT}</span>
            </S.Consent>
            {error('consent')}
            <S.Honeypot aria-hidden="true">
              <label>
                Não preencha este campo
                <input type="text" tabIndex={-1} autoComplete="off" value={answers.website} onChange={(e) => set({ website: e.target.value })} />
              </label>
            </S.Honeypot>
            {sendError && <S.Error role="alert">{sendError}</S.Error>}
          </S.Question>
        )}
      </S.Body>

      <S.Footer>
        <S.Ghost type="button" onClick={() => setStep(step - 1)}>
          Voltar
        </S.Ghost>
        <S.Primary type="button" onClick={next} disabled={sending} aria-busy={sending}>
          {step < STEPS ? 'Continuar' : sending ? 'Enviando…' : 'Enviar respostas'}
        </S.Primary>
      </S.Footer>
    </>
  )
}

function Swatches({ colors, selected, onToggle }: { colors: SurveyColor[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <S.Grid $cols={4} style={{ rowGap: 14 }}>
      {colors.map((c) => {
        const on = selected.includes(c.id)
        return (
          <S.Swatch key={c.id} type="button" $hex={c.hex} $light={isLight(c.hex)} aria-pressed={on} onClick={() => onToggle(c.id)}>
            <span>{on && <CheckIcon />}</span>
            <span>{c.name}</span>
          </S.Swatch>
        )
      })}
    </S.Grid>
  )
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <S.Intro>
      <S.Brand>
        <Wordmark title="Blessfit" />
        <span>Próxima coleção</span>
      </S.Brand>
      <div>
        <S.IntroTitle>Você escolhe as próximas peças.</S.IntroTitle>
        <S.IntroText>Conte quais modelos, cores e tamanhos você quer ver na loja. A gente produz a partir das respostas.</S.IntroText>
        <S.Perks>
          <li>
            <ClockIcon /> Leva menos de 2 minutos
          </li>
          <li>
            <GiftIcon /> Ganhe {SURVEY.coupon.percent}% OFF na próxima compra
          </li>
          <li>
            <SendIcon /> Seja avisada quando lançar
          </li>
        </S.Perks>
      </div>
      <S.Light type="button" onClick={onStart}>
        Começar
      </S.Light>
    </S.Intro>
  )
}

function Thanks() {
  const [copied, setCopied] = useState<'idle' | 'ok' | 'error'>('idle')
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => title.current?.focus(), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SURVEY.coupon.code)
      setCopied('ok')
    } catch {
      // navegador interno de app sem permissão: o código continua selecionável na tela
      setCopied('error')
    }
  }

  return (
    <S.Done>
      <S.DoneIcon>
        <CheckIcon />
      </S.DoneIcon>
      <div style={{ display: 'grid', gap: 10 }}>
        <h1 ref={title} tabIndex={-1}>
          Obrigada!
        </h1>
        <p>Suas respostas já fazem parte da próxima coleção. Aqui está o seu presente:</p>
      </div>
      <S.Coupon>
        <span>{SURVEY.coupon.percent}% OFF na sua próxima compra</span>
        <strong>{SURVEY.coupon.code}</strong>
      </S.Coupon>
      <S.Ghost type="button" onClick={copy}>
        {copied === 'ok' ? 'Cupom copiado!' : 'Copiar cupom'}
      </S.Ghost>
      {copied === 'error' && <S.Small role="status">Não deu para copiar. Toque no código e segure para copiar.</S.Small>}
      <S.Small>Informe o cupom no WhatsApp ao fazer o seu pedido.</S.Small>
      <S.LinkButton href={SITE_URL}>Ver a loja</S.LinkButton>
    </S.Done>
  )
}
