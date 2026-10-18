import { describe, expect, it } from 'vitest'
import { isPassword, safeNext } from './customer'

describe('safeNext', () => {
  it('aceita caminhos internos', () => {
    expect(safeNext('/carrinho')).toBe('/carrinho')
    expect(safeNext('/conta?x=1')).toBe('/conta?x=1')
  })

  it('recusa links para fora da loja', () => {
    for (const next of ['https://x.com', '//x.com', '/\\x.com', 'conta', '', undefined, null]) {
      expect(safeNext(next)).toBe('/conta')
    }
  })
})

describe('isPassword', () => {
  it('exige 8 caracteres com letras e números', () => {
    expect(isPassword('abc12345')).toBe(true)
    expect(isPassword('abc1234')).toBe(false)
    expect(isPassword('abcdefgh')).toBe(false)
    expect(isPassword('12345678')).toBe(false)
  })
})
