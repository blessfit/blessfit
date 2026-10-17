'use client'

/*
 * Carrinho e checkout (/carrinho): dados do cliente, endereço, frete e pagamento à esquerda;
 * sacola, cupom e totais à direita. "Finalizar pedido" cria o pedido em /api/checkout e leva
 * para o pagamento na InfinitePay.
 *
 * Os valores mostrados aqui são só uma prévia: o servidor recalcula itens, cupom e frete.
 * O rascunho do formulário (sem o CPF) fica salvo no navegador.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button, Check, ChevronLeft, Close, CreditCard, Minus, Picture, Plus, Repeat, Truck, Wordmark } from '@/components/ui'
import { SHOP } from '@/data/shop'
import { digits, isCpf, normalizeCep } from '@/lib/documents'
import { external, whatsappUrl } from '@/lib/links'
import { checkoutUrl, type BagLine } from '@/lib/orders'
import { formatBRL } from '@/lib/price'
import { useStore } from '@/store/storeContext'
import * as S from './Cart.styles'

type Method = 'pix' | 'card'

type Form = {
  name: string
  phone: string
  cpf: string
  email: string
  cep: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  uf: string
}

type ShippingOption = {
  id: number
  name: string
  carrier: string
  price: number
  days: { min: number; max: number }
  free: boolean
  cheapest: boolean
  fastest: boolean
}

type Quote =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; options: ShippingOption[]; key: string }
  | { status: 'error'; message: string }

type Coupon = { code: string; percent: number }

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')
const DRAFT_KEY = 'blessfit:checkout:v1'
const EMPTY: Form = { name: '', phone: '', cpf: '', email: '', cep: '', street: '', number: '', complement: '', district: '', city: '', uf: '' }

const mask = {
  cpf: (v: string) =>
    digits(v)
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})-?(\d{1,2})$/, '$1-$2'),
  phone: (v: string) => {
    const d = digits(v).slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    const split = d.length === 11 ? 7 : 6
    return `(${d.slice(0, 2)}) ${d.slice(2, split)}-${d.slice(split)}`
  },
  cep: (v: string) => digits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
}

const cents = (reais: number) => Math.round(reais * 100)
const unitCents = (line: BagLine, method: Method) => cents(method === 'pix' ? line.product.pix : line.product.price)
const apiLines = (lines: BagLine[]) => lines.map((l) => ({ id: l.product.id, color: l.variant.color.name, size: l.size, qty: l.qty }))
const days = ({ min, max }: { min: number; max: number }) => (min === max ? `${max} dias úteis` : `${min} a ${max} dias úteis`)

function validate(form: Form): Partial<Record<keyof Form, string>> {
  const errors: Partial<Record<keyof Form, string>> = {}
  if (form.name.trim().split(/\s+/).length < 2) errors.name = 'Informe nome e sobrenome'
  if (digits(form.phone).length < 10) errors.phone = 'Telefone com DDD'
  if (!isCpf(form.cpf)) errors.cpf = 'CPF inválido'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'E-mail inválido'
  if (!normalizeCep(form.cep)) errors.cep = 'CEP inválido'
  if (!form.street.trim()) errors.street = 'Informe a rua'
  if (!form.number.trim()) errors.number = 'Número (ou S/N)'
  if (!form.district.trim()) errors.district = 'Informe o bairro'
  if (!form.city.trim()) errors.city = 'Informe a cidade'
  if (!UFS.includes(form.uf)) errors.uf = 'Selecione'
  return errors
}

export function CartPage() {
  const { checkoutLines, bagTotal, setQty, removeFromBag } = useStore()
  const [form, setForm] = useState<Form>(EMPTY)
  const [method, setMethod] = useState<Method>('pix')
  const [quote, setQuote] = useState<Quote>({ status: 'idle' })
  const [serviceId, setServiceId] = useState<number | null>(null)
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponPending, setCouponPending] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // rascunho salvo (sem CPF); o servidor não tem o localStorage, então entra depois da 1ª renderização
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') as Partial<Form> | null
      if (draft) setForm((f) => ({ ...f, ...draft, cpf: '' }))
    } catch {
      // sem rascunho
    }
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, cpf: undefined }))
    } catch {
      // navegação privada: segue sem rascunho
    }
  }, [loaded, form])

  const set = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }))
  const errors = validate(form)
  const error = (key: keyof Form) => (showErrors ? errors[key] : undefined)

  const cep = normalizeCep(form.cep)
  const linesKey = JSON.stringify(apiLines(checkoutLines))
  const quoteKey = cep ? `${cep}|${linesKey}` : null

  // endereço pelo CEP (ViaCEP), quando o CEP muda
  useEffect(() => {
    if (!cep) return
    const controller = new AbortController()
    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }) => {
        if (data.erro) return
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          district: data.bairro || f.district,
          city: data.localidade || f.city,
          uf: data.uf || f.uf,
        }))
      })
      .catch(() => {
        // sem ViaCEP: o cliente digita o endereço
      })
    return () => controller.abort()
  }, [cep])

  // frete: cota de novo quando o CEP ou a sacola mudam
  useEffect(() => {
    if (!quoteKey || quoteKey.endsWith('|[]')) {
      setQuote({ status: 'idle' })
      return
    }
    const controller = new AbortController()
    setQuote({ status: 'loading' })
    fetch('/api/shipping/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cep: quoteKey.slice(0, 8), lines: JSON.parse(quoteKey.slice(9)) }),
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = (await r.json()) as { options?: ShippingOption[]; error?: string }
        if (!r.ok || !data.options) throw new Error(data.error ?? 'Não foi possível calcular o frete')
        if (data.options.length === 0) throw new Error('Não entregamos neste CEP. Fale com a gente no WhatsApp.')
        setQuote({ status: 'ok', options: data.options, key: quoteKey })
        setServiceId((current) => (data.options!.some((o) => o.id === current) ? current : data.options![0].id))
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setQuote({ status: 'error', message: err.message })
      })
    return () => controller.abort()
    // quoteKey já inclui o CEP e as linhas da sacola
  }, [quoteKey])

  const option = quote.status === 'ok' ? quote.options.find((o) => o.id === serviceId) ?? null : null

  const totals = useMemo(() => {
    const at = (m: Method) => {
      const items = checkoutLines.reduce((sum, l) => sum + unitCents(l, m) * l.qty, 0)
      const discount = coupon
        ? checkoutLines.reduce((sum, l) => sum + Math.round((unitCents(l, m) * coupon.percent) / 100) * l.qty, 0)
        : 0
      const shipping = option ? cents(option.price) : 0
      return { items, discount, shipping, total: items - discount + shipping }
    }
    return { pix: at('pix'), card: at('card') }
  }, [checkoutLines, coupon, option])
  const current = totals[method]
  const pieces = checkoutLines.reduce((n, l) => n + l.qty, 0)
  // produto com frete grátis (painel → Preços) já garante o frete grátis do pedido
  const freeProduct = checkoutLines.some((l) => l.product.freeShipping)
  const missing = freeProduct ? 0 : Math.max(0, SHOP.freeShippingFrom - bagTotal)

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponPending(true)
    setCouponError(null)
    try {
      const r = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, cpf: form.cpf }),
      })
      const data = (await r.json()) as Coupon & { error?: string }
      if (!r.ok) throw new Error(data.error ?? 'Cupom inválido')
      setCoupon({ code: data.code, percent: data.percent })
      setCouponInput('')
    } catch (err) {
      setCouponError((err as Error).message)
    } finally {
      setCouponPending(false)
    }
  }

  const submit = async () => {
    setShowErrors(true)
    setSubmitError(null)
    if (Object.keys(errors).length > 0) {
      document.querySelector('[data-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (!option) {
      setSubmitError('Escolha uma opção de frete')
      return
    }
    setSubmitting(true)
    // a aba do pagamento abre já no clique (depois do await o navegador bloquearia); esta aba acompanha o status
    const tab = window.open('', '_blank')
    tab?.document.write('<p style="font-family:sans-serif;padding:24px">Abrindo o pagamento seguro da InfinitePay…</p>')
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          lines: apiLines(checkoutLines),
          customer: { name: form.name, cpf: form.cpf, phone: form.phone, email: form.email },
          address: { cep: form.cep, street: form.street, number: form.number, complement: form.complement, district: form.district, city: form.city, uf: form.uf },
          shipping: { serviceId: option.id, price: option.price },
          coupon: coupon?.code,
        }),
      })
      const data = (await r.json()) as { orderId?: string; url?: string; error?: string; code?: string; options?: ShippingOption[] }
      if (r.status === 409 && data.options && quoteKey) {
        setQuote({ status: 'ok', options: data.options, key: quoteKey })
        setServiceId(data.options[0]?.id ?? null)
        throw new Error(data.error ?? 'O frete mudou. Confira as opções de novo.')
      }
      if (!r.ok || !data.url || !data.orderId) throw new Error(data.error ?? 'Não foi possível finalizar o pedido')
      if (tab && !tab.closed) {
        tab.location.href = data.url
        window.location.href = `/pedido/${data.orderId}`
      } else {
        // pop-up bloqueado: paga nesta mesma aba e volta para /pedido no fim
        window.location.href = data.url
      }
    } catch (err) {
      tab?.close()
      setSubmitError((err as Error).message)
      setSubmitting(false)
    }
  }

  if (checkoutLines.length === 0) {
    return (
      <CheckoutShell>
        <S.Empty>
          <h1>Sua sacola está vazia</h1>
          <p>Escolha suas peças e volte aqui para finalizar.</p>
          <Button variant="primary" href="/#conjuntos">
            Ver produtos
          </Button>
        </S.Empty>
      </CheckoutShell>
    )
  }

  return (
    <CheckoutShell>
      <S.Layout>
        <S.Steps>
          <S.Card aria-labelledby="passo-1">
            <StepHead n={1} id="passo-1" title="Seus dados" text="Para a nota fiscal e para avisarmos sobre o envio." />
            <S.Grid>
              <TextField label="Nome completo" span={6} value={form.name} onChange={(v) => set('name', v)} error={error('name')} autoComplete="name" placeholder="ex.: Maria Silva Santos" />
              <TextField label="Celular / WhatsApp" span={3} value={form.phone} onChange={(v) => set('phone', mask.phone(v))} error={error('phone')} autoComplete="tel-national" inputMode="tel" placeholder="(37) 99999-9999" />
              <TextField label="CPF" span={3} value={form.cpf} onChange={(v) => set('cpf', mask.cpf(v))} error={error('cpf')} inputMode="numeric" placeholder="000.000.000-00" />
              <TextField label="E-mail" span={6} value={form.email} onChange={(v) => set('email', v)} error={error('email')} autoComplete="email" inputMode="email" placeholder="seu-email@provedor.com" />
            </S.Grid>
          </S.Card>

          <S.Card aria-labelledby="passo-2">
            <StepHead n={2} id="passo-2" title="Endereço de entrega" text="Onde você quer receber suas peças." />
            <S.Grid>
              <S.Field $span={2} $spanSm={2} data-invalid={Boolean(error('cep'))}>
                <span>
                  CEP <S.Required>*</S.Required>
                </span>
                <S.CepRow>
                  <input value={form.cep} onChange={(e) => set('cep', mask.cep(e.target.value))} autoComplete="postal-code" inputMode="numeric" placeholder="00000-000" />
                </S.CepRow>
                {error('cep') && <small>{error('cep')}</small>}
              </S.Field>
              <TextField label="Rua / Avenida" span={4} value={form.street} onChange={(v) => set('street', v)} error={error('street')} autoComplete="address-line1" />
              <TextField label="Número" span={2} spanSm={1} value={form.number} onChange={(v) => set('number', v)} error={error('number')} placeholder="123 ou S/N" />
              <TextField label="Complemento" span={4} spanSm={1} required={false} value={form.complement} onChange={(v) => set('complement', v)} placeholder="Apto, bloco (opcional)" autoComplete="address-line2" />
              <TextField label="Bairro" span={2} value={form.district} onChange={(v) => set('district', v)} error={error('district')} />
              <TextField label="Cidade" span={3} spanSm={1} value={form.city} onChange={(v) => set('city', v)} error={error('city')} autoComplete="address-level2" />
              <S.Field $span={1} $spanSm={1} data-invalid={Boolean(error('uf'))}>
                <span>
                  UF <S.Required>*</S.Required>
                </span>
                <select value={form.uf} onChange={(e) => set('uf', e.target.value)} autoComplete="address-level1">
                  <option value="">—</option>
                  {UFS.map((uf) => (
                    <option key={uf}>{uf}</option>
                  ))}
                </select>
                {error('uf') && <small>{error('uf')}</small>}
              </S.Field>
            </S.Grid>
          </S.Card>

          <S.Card aria-labelledby="passo-3">
            <StepHead n={3} id="passo-3" title="Opção de envio" text="Escolha a entrega. O prazo conta a partir da confirmação do pagamento." />
            {quote.status === 'idle' && (
              <S.Placeholder>
                <Truck /> Informe o CEP no passo 2 para ver as opções e os prazos de entrega.
              </S.Placeholder>
            )}
            {quote.status === 'loading' && (
              <S.Placeholder>
                <Truck /> Calculando o frete…
              </S.Placeholder>
            )}
            {quote.status === 'error' && <S.Error role="alert">{quote.message}</S.Error>}
            {quote.status === 'ok' && (
              <S.Options role="radiogroup" aria-label="Opções de frete">
                {quote.options.map((o) => (
                  <S.Option key={o.id} $checked={o.id === serviceId}>
                    <input type="radio" name="frete" checked={o.id === serviceId} onChange={() => setServiceId(o.id)} />
                    <S.OptionText>
                      <strong>
                        {o.carrier} {o.name}
                      </strong>
                      Chega em {days(o.days)}
                      {(o.cheapest || o.fastest) && (
                        <S.Tags>
                          {o.cheapest && <S.Tag>Mais barato</S.Tag>}
                          {o.fastest && <S.Tag>Mais rápido</S.Tag>}
                        </S.Tags>
                      )}
                    </S.OptionText>
                    <S.OptionPrice $free={o.free}>{o.free ? 'Grátis' : formatBRL(o.price)}</S.OptionPrice>
                  </S.Option>
                ))}
              </S.Options>
            )}
          </S.Card>

          <S.Card aria-labelledby="passo-4">
            <StepHead n={4} id="passo-4" title="Pagamento" text="Você paga no ambiente seguro da InfinitePay." />
            <S.PayOptions role="radiogroup" aria-label="Forma de pagamento">
              <S.Option $checked={method === 'pix'}>
                <input type="radio" name="pagamento" checked={method === 'pix'} onChange={() => setMethod('pix')} />
                <S.OptionText>
                  <strong>Pix · {formatBRL(totals.pix.total / 100)}</strong>
                  {totals.card.total > totals.pix.total
                    ? `Economize ${formatBRL((totals.card.total - totals.pix.total) / 100)}`
                    : 'Aprovação na hora'}
                </S.OptionText>
              </S.Option>
              <S.Option $checked={method === 'card'}>
                <input type="radio" name="pagamento" checked={method === 'card'} onChange={() => setMethod('card')} />
                <S.OptionText>
                  <strong>Cartão · {formatBRL(totals.card.total / 100)}</strong>
                  Em até {SHOP.installments}x de {formatBRL(Math.floor(totals.card.total / SHOP.installments) / 100)} sem juros
                </S.OptionText>
              </S.Option>
            </S.PayOptions>
          </S.Card>
        </S.Steps>

        <S.Aside aria-label="Resumo do pedido">
          <S.FreeShipping>
            <p>
              {missing > 0 ? (
                <>
                  Faltam <strong>{formatBRL(missing)}</strong> para o frete grátis
                </>
              ) : (
                <strong>Você ganhou frete grátis!</strong>
              )}
            </p>
            <span>
              <i style={{ width: `${missing === 0 ? 100 : Math.min(100, (bagTotal / SHOP.freeShippingFrom) * 100)}%` }} />
            </span>
          </S.FreeShipping>

          <S.BagTitle>
            Sua sacola <span>{pieces === 1 ? '1 peça' : `${pieces} peças`}</span>
          </S.BagTitle>
          <S.Lines>
            {checkoutLines.map((line) => (
              <S.Line key={`${line.product.id}-${line.variant.color.name}-${line.size}`}>
                <S.Thumb>
                  <Picture image={line.variant.images.main} decorative sizes="64px" />
                </S.Thumb>
                <div>
                  <S.LineName>{line.product.name}</S.LineName>
                  <S.LineMeta>
                    {line.variant.color.name} · Tam. {line.size}
                  </S.LineMeta>
                  <S.Qty>
                    <button type="button" aria-label="Diminuir quantidade" disabled={line.qty <= 1} onClick={() => setQty(line, line.qty - 1)}>
                      <Minus />
                    </button>
                    <span aria-live="polite">{line.qty}</span>
                    <button type="button" aria-label="Aumentar quantidade" onClick={() => setQty(line, line.qty + 1)}>
                      <Plus />
                    </button>
                  </S.Qty>
                </div>
                <S.LineEnd>
                  <button type="button" aria-label={`Remover ${line.product.name}`} onClick={() => removeFromBag(line)}>
                    <Close />
                  </button>
                  <strong>{formatBRL((unitCents(line, method) * line.qty) / 100)}</strong>
                </S.LineEnd>
              </S.Line>
            ))}
          </S.Lines>

          <S.CouponBox>
            {coupon ? (
              <S.Applied>
                <span>
                  ✓ Cupom {coupon.code} aplicado ({coupon.percent}% OFF)
                </span>
                <button type="button" onClick={() => setCoupon(null)}>
                  Remover
                </button>
              </S.Applied>
            ) : (
              <>
                <label htmlFor="cupom">Tem cupom de desconto?</label>
                <S.CouponRow>
                  <input
                    id="cupom"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                    placeholder="Digite seu cupom"
                    autoComplete="off"
                  />
                  <S.SmallButton type="button" onClick={applyCoupon} disabled={couponPending || !couponInput.trim()}>
                    {couponPending ? '…' : 'Aplicar'}
                  </S.SmallButton>
                </S.CouponRow>
                {couponError && <S.Error role="alert">{couponError}</S.Error>}
              </>
            )}
          </S.CouponBox>

          <S.Totals>
            <div>
              <dt>Subtotal ({method === 'pix' ? 'Pix' : 'cartão'})</dt>
              <dd>{formatBRL(current.items / 100)}</dd>
            </div>
            {coupon && (
              <div>
                <dt>Desconto ({coupon.code})</dt>
                <S.Discount>− {formatBRL(current.discount / 100)}</S.Discount>
              </div>
            )}
            <div>
              <dt>Frete</dt>
              <dd>{option ? (option.free ? 'Grátis' : formatBRL(option.price)) : 'Informe o CEP'}</dd>
            </div>
          </S.Totals>

          <S.Grand>
            <p>
              Total <strong>{formatBRL(current.total / 100)}</strong>
            </p>
            <p>
              {method === 'pix'
                ? 'à vista no Pix'
                : `em até ${SHOP.installments}x de ${formatBRL(Math.floor(current.total / SHOP.installments) / 100)} sem juros`}
            </p>
          </S.Grand>

          <Button as="button" variant="primary" block onClick={submit} disabled={submitting} aria-busy={submitting}>
            {submitting
              ? 'Abrindo o pagamento…'
              : method === 'pix'
                ? `Pagar ${formatBRL(current.total / 100)} no Pix`
                : `Pagar no cartão em até ${SHOP.installments}x`}
          </Button>
          <S.Alt>
            O pagamento abre numa nova aba, no ambiente seguro da InfinitePay. Lá, escolha{' '}
            <strong>{method === 'pix' ? 'Pix' : 'cartão de crédito'}</strong> para manter este valor. Esta página mostra quando o
            pagamento for aprovado.
          </S.Alt>
          {submitError && <S.Error role="alert">{submitError}</S.Error>}

          <S.Trust>
            <li>
              <CreditCard /> Pagamento seguro pela InfinitePay
            </li>
            <li>
              <Truck /> Entrega com código de rastreio
            </li>
            <li>
              <Repeat /> Primeira troca por nossa conta, em até 7 dias
            </li>
          </S.Trust>

          <S.Alt>
            Prefere?{' '}
            <a href={checkoutUrl(checkoutLines)} {...external}>
              Finalize pelo WhatsApp
            </a>
          </S.Alt>
        </S.Aside>
      </S.Layout>
    </CheckoutShell>
  )
}

export function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <S.Page>
      <S.Top>
        <S.TopInner>
          <a href="/" aria-label={`${SHOP.name} — voltar para a loja`}>
            <Wordmark />
          </a>
          <S.Secure>
            <Check /> Compra 100% segura
          </S.Secure>
        </S.TopInner>
      </S.Top>
      <S.Main id="conteudo">
        <S.Crumbs aria-label="Navegação">
          <a href="/">
            <ChevronLeft /> Continuar comprando
          </a>
          <span>/</span>
          <span>Finalizar pedido</span>
        </S.Crumbs>
        {children}
      </S.Main>
      <S.Alt style={{ paddingBottom: 32 }}>
        Dúvidas?{' '}
        <a href={whatsappUrl()} {...external}>
          Fale com a gente no WhatsApp
        </a>
      </S.Alt>
    </S.Page>
  )
}

function StepHead({ n, id, title, text }: { n: number; id: string; title: string; text: string }) {
  return (
    <S.StepHead>
      <S.StepNumber aria-hidden="true">{n}</S.StepNumber>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{text}</p>
      </div>
    </S.StepHead>
  )
}

function TextField({
  label,
  value,
  onChange,
  error,
  span,
  spanSm,
  required = true,
  ...input
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  span?: number
  spanSm?: number
  required?: boolean
  placeholder?: string
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
}) {
  return (
    <S.Field $span={span} $spanSm={spanSm} data-invalid={Boolean(error)}>
      <span>
        {label} {required && <S.Required>*</S.Required>}
      </span>
      <input value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} {...input} />
      {error && <small>{error}</small>}
    </S.Field>
  )
}
