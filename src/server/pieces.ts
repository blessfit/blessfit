/*
 * Dados internos das peças, vindos da planilha “Estoque BlessFit (com conjuntos)”: nome do fornecedor,
 * preço de custo. De quais peças cada conjunto é montado fica em src/data/catalog.ts (`parts`).
 * Fica em src/server/ de propósito: o custo nunca vai para o código do site (navegador).
 */
import 'server-only'

/** Por referência da peça (a mesma do site): nome do produto no fornecedor e preço de custo. */
export const PIECES: Record<string, { supplier: string; cost: number; name?: string }> = {
  'BF-F01-T': { supplier: 'Top Poliamida Alcinha', cost: 42.9 },
  'BF-F01-S': { supplier: 'Short Legging', cost: 42.9 },
  // não é vendido sozinho no site: só dentro do Conjunto Aurora
  'BF-F02-T': { supplier: 'Top Nadador', cost: 42.9, name: 'Top Aurora (vem no Conjunto Aurora)' },
  'BF-F03-R': { supplier: 'Regata UV', cost: 42.9 },
  'BF-F03-L': { supplier: 'Calça Legging', cost: 64.9 },
  'BF-M01-C': { supplier: 'Camisa UV', cost: 42.9 },
  'BF-M01-S': { supplier: 'Bermuda Poliamida', cost: 42.9 },
  'BF-M02-R': { supplier: 'Regata UV', cost: 42.9 },
}

/** Sigla da cor no código (ex.: BF-M02-R-PRE-G). */
export const COLOR_CODE: Record<string, string> = {
  Preto: 'PRE',
  'Azul Petróleo': 'PET',
  'Azul Marinho': 'MAR',
  Azul: 'AZU',
  Branco: 'BRA',
  Grafite: 'GRA',
  Coral: 'COR',
}

export const colorCode = (color: string) =>
  COLOR_CODE[color] ??
  color
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .slice(0, 3)
    .toUpperCase()
