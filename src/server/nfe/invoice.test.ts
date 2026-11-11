import { describe, expect, it } from 'vitest'
import type { Order, OrderItem } from '../orders'
import { nfeBody } from './bling'
import { brasiliaDateTime, buildInvoice, itemCode, type InvoiceConfig } from './invoice'

const NOW = new Date('2026-11-10T14:30:05Z')
const config: InvoiceConfig = { environment: 'test', natureId: 15, paymentIds: { pix: 101, card: 102 } }

const conjunto: OrderItem = {
  id: 'conjunto-mare',
  ref: 'BF-F01',
  color: 'Azul Petróleo',
  size: 'M',
  quantity: 1,
  price: 18990,
  description: 'Conjunto Maré · Azul Petróleo · M',
}
const regata: OrderItem = {
  id: 'regata-brisa',
  ref: 'BF-F03-R',
  color: 'Preto',
  size: 'G',
  quantity: 2,
  price: 6990,
  description: 'Regata Brisa · Preto · G',
}

const order = (patch: Partial<Order> = {}): Order => {
  const items = patch.items ?? [conjunto]
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = patch.discount_cents ?? 0
  const shipping = patch.shipping_cents ?? 0
  return {
    id: 'pedido',
    status: 'paid',
    method: 'pix',
    items,
    items_total_cents: itemsTotal,
    discount_cents: discount,
    shipping_cents: shipping,
    total_cents: itemsTotal - discount + shipping,
    paid_amount_cents: itemsTotal - discount + shipping,
    paid_at: '2026-11-10T02:10:00Z',
    customer: { name: 'Maria Silva', phone_number: '+5537999998888', email: 'maria@example.com' },
    customer_cpf: '099.266.516-74',
    shipping_address: { cep: '35500-163', street: 'Rua Goiás', number: '100', district: 'Centro', city: 'Divinópolis', uf: 'MG' },
    shipping: {
      serviceId: 1,
      name: 'PAC',
      carrier: 'Correios',
      priceCents: shipping,
      costCents: 2000,
      days: { min: 3, max: 6 },
      source: 'live',
      parcel: { weightG: 430, lengthCm: 30, widthCm: 25, heightCm: 5, insuranceCents: itemsTotal },
    },
    nfe_key: null,
    ...patch,
  } as Order
}

const draftOf = (o: Order, c = config) => {
  const result = buildInvoice(o, c, NOW)
  if (!result.ok) throw new Error(result.error)
  return result.draft
}
const errorOf = (o: Order, c = config) => {
  const result = buildInvoice(o, c, NOW)
  if (result.ok) throw new Error('esperava recusa')
  return result.error
}

describe('itemCode', () => {
  it('é único por variação, sem acento nem espaço', () => {
    expect(itemCode('BF-F01', 'Azul Petróleo', 'M')).toBe('BF-F01-AZUL-PETROLEO-M')
    expect(itemCode('BF-F01', 'Azul Petróleo', 'GG')).not.toBe(itemCode('BF-F01', 'Azul Petróleo', 'M'))
  })
})

describe('brasiliaDateTime', () => {
  it('usa o horário de Brasília', () => {
    expect(brasiliaDateTime(NOW)).toBe('2026-11-10 11:30:05')
    expect(brasiliaDateTime(new Date('2026-11-10T02:10:00Z'))).toBe('2026-11-09 23:10:00')
  })
})

describe('buildInvoice', () => {
  it('frete grátis em MG: destinatário, item e pagamento', () => {
    const draft = draftOf(order())
    expect(draft.customer).toEqual({
      name: 'Maria Silva',
      cpf: '09926651674',
      email: 'maria@example.com',
      phone: '37999998888',
      address: { street: 'Rua Goiás', number: '100', complement: undefined, district: 'Centro', cep: '35500163', city: 'Divinópolis', uf: 'MG' },
    })
    expect(draft.items).toEqual([
      { code: 'BF-F01-AZUL-PETROLEO-M', description: conjunto.description, quantity: 1, unitCents: 18990, ncm: '6104.23.00', origin: 0, weightKg: 0.4 },
    ])
    expect(draft.shippingCents).toBe(0)
    expect(draft.payment).toEqual({ date: '2026-11-10', amountCents: 18990, methodId: 101 })
    expect(draft.issuedAt).toBe('2026-11-10 11:30:05')
  })

  it('fora de MG, frete pago, cupom e vários itens: o total fecha', () => {
    const draft = draftOf(
      order({
        method: 'card',
        items: [conjunto, regata],
        discount_cents: 3297,
        shipping_cents: 3150,
        shipping_address: { cep: '01310100', street: 'Av. Paulista', number: '', complement: 'ap 12', district: 'Bela Vista', city: 'São Paulo', uf: 'SP' },
      }),
    )
    const items = draft.items.reduce((sum, i) => sum + i.unitCents * i.quantity, 0)
    expect(items - draft.discountCents + draft.shippingCents).toBe(draft.payment.amountCents)
    expect(draft.payment.methodId).toBe(102)
    expect(draft.customer.address).toMatchObject({ number: 'S/N', complement: 'ap 12', uf: 'SP' })
    expect(draft.volume).toEqual({ grossKg: 0.7, netKg: 0.7 })
  })

  it.each([
    ['pedido não pago', order({ status: 'review' }), /pagos/],
    ['chave colada à mão', order({ nfe_key: '31261069633993000135550010000000011747578935' }), /chave/],
    ['sem CPF', order({ customer_cpf: null }), /CPF/],
    ['CPF inválido', order({ customer_cpf: '11111111111' }), /CPF/],
    ['sem endereço', order({ shipping_address: null }), /Endereço/],
    ['sem UF', order({ shipping_address: { cep: '35500163', street: 'Rua', number: '1', district: 'Centro', city: 'Divinópolis', uf: '' } }), /Endereço/],
    ['produto fora do catálogo', order({ items: [{ ...conjunto, id: 'nao-existe' }] }), /catálogo/],
  ])('recusa %s', (_, o, message) => {
    expect(errorOf(o)).toMatch(message)
  })

  it('recusa quando o total não fecha', () => {
    expect(errorOf(order({ total_cents: 1 }))).toMatch(/total/)
    expect(errorOf(order({ items_total_cents: 1 }))).toMatch(/subtotal/)
  })

  it('recusa quando o valor pago diverge', () => {
    expect(errorOf(order({ paid_amount_cents: 100 }))).toMatch(/valor pago/)
  })

  it('recusa sem natureza ou forma de pagamento', () => {
    expect(errorOf(order(), { ...config, natureId: null })).toMatch(/BLING_NATUREZA_ID/)
    expect(errorOf(order(), { ...config, paymentIds: { pix: null, card: 102 } })).toMatch(/Pix/)
  })

  it('em produção, recusa enquanto o contador não conferir os dados fiscais', () => {
    expect(errorOf(order(), { ...config, environment: 'production' })).toMatch(/contador/)
  })
})

describe('nfeBody', () => {
  it('traduz para o formato do POST /nfe, em reais', () => {
    const body = nfeBody(draftOf(order({ items: [conjunto, regata], discount_cents: 1000, shipping_cents: 2590 })))
    expect(body).toMatchObject({
      tipo: 1,
      naturezaOperacao: { id: 15 },
      contato: { tipoPessoa: 'F', numeroDocumento: '09926651674', contribuinte: 9, endereco: { municipio: 'Divinópolis', uf: 'MG' } },
      desconto: 10,
      transporte: { fretePorConta: 0, frete: 25.9, transportador: { nome: 'Correios' }, volume: { quantidade: 1, especie: 2 } },
      parcelas: [{ data: '2026-11-10', valor: 345.6, formaPagamento: { id: 101 } }],
    })
    expect(body.itens[1]).toEqual({
      codigo: 'BF-F03-R-PRETO-G',
      descricao: regata.description,
      unidade: 'UN',
      quantidade: 2,
      valor: 69.9,
      tipo: 'P',
      classificacaoFiscal: '6104.23.00',
      origem: 0,
      pesoBruto: 0.15,
      pesoLiquido: 0.15,
    })
    expect(body).not.toHaveProperty('numero')
  })

  it('sem cupom não manda desconto', () => {
    expect(nfeBody(draftOf(order()))).not.toHaveProperty('desconto')
  })
})
