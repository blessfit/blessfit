import { describe, expect, it } from 'vitest'
import { isCpf, isNfeKey, normalizeCep, regionOf } from './documents'

describe('isCpf', () => {
  it('aceita CPF válido com ou sem pontuação', () => {
    expect(isCpf('529.982.247-25')).toBe(true)
    expect(isCpf('52998224725')).toBe(true)
  })
  it('recusa dígito verificador errado, dígitos repetidos e tamanho errado', () => {
    expect(isCpf('529.982.247-24')).toBe(false)
    expect(isCpf('111.111.111-11')).toBe(false)
    expect(isCpf('5299822472')).toBe(false)
  })
})

describe('normalizeCep', () => {
  it('tira a pontuação e exige 8 dígitos', () => {
    expect(normalizeCep('30130-010')).toBe('30130010')
    expect(normalizeCep('3013001')).toBeNull()
    expect(normalizeCep('00000-000')).toBeNull()
  })
})

describe('regionOf', () => {
  it.each([
    ['01310100', 'Sudeste'],
    ['30130010', 'Sudeste'],
    ['35500000', 'Sudeste'],
    ['29000000', 'Sudeste'],
    ['40000000', 'Nordeste'],
    ['65000000', 'Nordeste'],
    ['66000000', 'Norte'],
    ['69000000', 'Norte'],
    ['77000000', 'Norte'],
    ['76800000', 'Norte'],
    ['70000000', 'Centro-Oeste'],
    ['79000000', 'Centro-Oeste'],
    ['80000000', 'Sul'],
    ['90000000', 'Sul'],
  ])('%s → %s', (cep, region) => {
    expect(regionOf(cep)).toBe(region)
  })
})

describe('isNfeKey', () => {
  const key = '31261031234567000190550010000001231000001237'
  it('aceita chave com dígito verificador certo', () => {
    expect(isNfeKey(key)).toBe(true)
    expect(isNfeKey(key.replace(/(\d{4})/g, '$1 '))).toBe(true)
  })
  it('recusa dígito verificador errado e tamanho errado', () => {
    expect(isNfeKey(`${key.slice(0, 43)}8`)).toBe(false)
    expect(isNfeKey(key.slice(0, 43))).toBe(false)
  })
})
