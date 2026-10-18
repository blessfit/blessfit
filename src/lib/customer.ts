/*
 * Dados do cliente: máscaras e validações usadas no checkout, no cadastro e em /conta.
 * Roda no navegador (formulários) e no servidor (rotas e server actions).
 */
import { digits, isCpf, normalizeCep } from './documents'

export const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

export const mask = {
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

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

/** Senha da conta: 8+ caracteres, com letras e números (mesma regra configurada no Supabase). */
export const isPassword = (value: string) => value.length >= 8 && /[a-z]/i.test(value) && /\d/.test(value)

export const isFullName = (value: string) => value.trim().split(/\s+/).length >= 2

export const isPhone = (value: string) => digits(value).length >= 10

export { isCpf }

export type AddressForm = {
  cep: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  uf: string
}

export const EMPTY_ADDRESS: AddressForm = { cep: '', street: '', number: '', complement: '', district: '', city: '', uf: '' }

export function addressErrors(address: AddressForm): Partial<Record<keyof AddressForm, string>> {
  const errors: Partial<Record<keyof AddressForm, string>> = {}
  if (!normalizeCep(address.cep)) errors.cep = 'CEP inválido'
  if (!address.street.trim()) errors.street = 'Informe a rua'
  if (!address.number.trim()) errors.number = 'Número (ou S/N)'
  if (!address.district.trim()) errors.district = 'Informe o bairro'
  if (!address.city.trim()) errors.city = 'Informe a cidade'
  if (!UFS.includes(address.uf)) errors.uf = 'Selecione'
  return errors
}

/**
 * Para onde voltar depois do login. Só caminhos internos ("/carrinho", "/conta?x=1"): qualquer outra
 * coisa ("https://…", "//site", "/\site") vira `fallback`, para o link não mandar o cliente para fora da loja.
 */
export function safeNext(next: unknown, fallback = '/conta'): string {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}
