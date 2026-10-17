/*
 * Validação de CPF, CEP e chave de NF-e. Roda no navegador (formulário) e no servidor (checkout e painel).
 */
import type { Region } from '@/data/shipping'

export const digits = (value: string) => value.replace(/\D/g, '')

/** CPF com os dois dígitos verificadores certos (aceita com ou sem pontuação). */
export function isCpf(value: string): boolean {
  const cpf = digits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const check = (length: number) => {
    let sum = 0
    for (let i = 0; i < length; i++) sum += Number(cpf[i]) * (length + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return check(9) === Number(cpf[9]) && check(10) === Number(cpf[10])
}

/** CEP só com dígitos, ou null se não tiver 8 dígitos. */
export function normalizeCep(value: string): string | null {
  const cep = digits(value)
  return cep.length === 8 && cep !== '00000000' ? cep : null
}

/** Região do Brasil pela faixa do CEP (ex.: 3xxxx = MG = Sudeste). */
export function regionOf(cep: string): Region {
  const prefix = Number(cep.slice(0, 3))
  if (prefix < 400) return 'Sudeste' // SP, RJ, ES, MG
  if (prefix < 660) return 'Nordeste' // BA, SE, PE, AL, PB, RN, CE, PI, MA
  if (prefix < 700) return 'Norte' // PA, AP, AM, RR, AC
  if (prefix >= 770 && prefix < 780) return 'Norte' // TO
  if (prefix >= 768 && prefix < 770) return 'Norte' // RO
  if (prefix < 800) return 'Centro-Oeste' // DF, GO, MT, MS
  return 'Sul' // PR, SC, RS
}

/** Chave de acesso da NF-e: 44 dígitos com o dígito verificador (módulo 11) certo. */
export function isNfeKey(value: string): boolean {
  const key = digits(value)
  if (key.length !== 44) return false
  let sum = 0
  let weight = 2
  for (let i = 42; i >= 0; i--) {
    sum += Number(key[i]) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  const rest = sum % 11
  return (rest < 2 ? 0 : 11 - rest) === Number(key[43])
}
