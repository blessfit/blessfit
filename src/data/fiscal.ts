/*
 * Dados fiscais fixos da NF-e (docs/spec-nfe-bling.md §8). A regra fiscal (CFOP, CSOSN, alíquotas) fica na
 * natureza de operação do Bling: aqui só o que vai em cada item da nota.
 *
 * ⏳ Valores PROVISÓRIOS, usados só no ambiente de teste. NCM e origem dependem do contador
 * (docs/pendencias-prod-nfe.md). Enquanto `reviewed` for false, a emissão em produção é recusada.
 */
import type { Kind } from './catalog'

export const FISCAL = {
  /** Vira true só quando o contador conferir NCM e origem. */
  reviewed: false,
  /** NCM por tipo de peça. `6104.23.00` é um palpite usado só em teste. */
  ncm: {
    Conjunto: '6104.23.00',
    Blusa: '6104.23.00',
    Shorts: '6104.23.00',
    Legging: '6104.23.00',
  } satisfies Record<Kind, string>,
  /** Origem da mercadoria: `0` = nacional. */
  origin: 0,
} as const
