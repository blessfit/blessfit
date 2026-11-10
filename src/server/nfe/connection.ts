/* Constantes do fluxo "Conectar Bling", compartilhadas pela action, pelo callback e pelo painel. */

/** Cookie HttpOnly com `{state}.{id do pedido}`, para validar o retorno e voltar ao pedido. */
export const BLING_STATE_COOKIE = 'bling_oauth_state'
export const BLING_STATE_PATH = '/api/bling'

export type BlingConnectResult = 'conectado' | 'sem-acesso-nfe' | 'erro' | 'estado-invalido' | 'recusado' | 'desligado'
