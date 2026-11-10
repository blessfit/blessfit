# Pendências para levar a NF-e do Bling à produção

Primeiro entregamos tudo no **ambiente de teste** (`docs/spec-nfe-bling.md`). Esta lista reúne o que falta para
produção e é atualizada a cada passo. Nada aqui deve ser feito antes de a §13 da spec passar em teste.

## Dados do contador (loja)

- [ ] NCM por tipo de peça. `6104.23.00` foi usado só em teste e é um palpite.
- [ ] CFOP dentro e fora de MG. Em teste a natureza escolheu 5102 em MG e 6108 para SP (não contribuinte): o contador confirma, e diz se é 6108 ou 6107.
- [ ] CSOSN.
- [ ] Origem da mercadoria (`itens[].origem`).
- [ ] Gravar NCM e origem em `src/data/fiscal.ts` e virar `FISCAL.reviewed` para `true`. Enquanto estiver
      `false`, o site recusa emitir em produção.
- [ ] Orientação sobre DIFAL em venda a consumidor final de outro estado.
- [ ] Conferência da natureza de operação de produção. Inclui presença na internet, sem intermediador e consumidor
      final no XML, porque a API não envia esses campos e eles dependem da configuração.

- [ ] Indicador de presença: nas notas criadas pela API saiu `indPres=9`, e o correto para a loja virtual é `2`
      (internet). Descobrir com o contador ou o suporte do Bling como a natureza preenche esse campo.

## Conta Bling (loja, com aviso antes)

- [ ] Conferir se a conta e o certificado A1 estão prontos para emitir em produção.
- [ ] Virar a conta do ambiente de teste para produção.
- [ ] Decidir se haverá conta Bling separada para homologação. Com conta única, depois da virada um teste no site
      emitiria nota real, então a emissão precisa ficar desligada em homologação (`BLING_EMISSION_ENV` vazia).
- [ ] Emitir a primeira nota real à mão (item 3 da §2 da spec, adiado por decisão de 31/10/2026).
- [ ] Anotar o id dessa nota para `BLING_ENV_PROBE_NFE_ID`.
- [ ] Criar o aplicativo de produção, **Privado**, com retorno em
      `https://www.blessfitstore.com.br/api/bling/callback`. O cadastro aceita um só endereço.
- [ ] Marcar os mesmos escopos validados em teste. Alterá-los depois revoga a conexão.

## Banco de produção

- [ ] Aplicar `supabase/migrations/20261031000000_nfe_bling.sql`. Até agora só foi aplicada no `blessfit-hml`.
- [ ] Conferir no Supabase os avisos de segurança da tabela `bling_auth`.

## Variáveis na Vercel (produção)

- [ ] `BLING_CLIENT_ID` e `BLING_CLIENT_SECRET` do aplicativo de produção.
- [ ] `BLING_TOKEN_KEY` nova, gerada só para produção (`openssl rand -base64 32`). Não reutilizar a de teste.
- [ ] `CRON_SECRET` novo.
- [ ] `BLING_EMISSION_ENV=production`, por último, porque é ela que liga o botão.
- [ ] `BLING_NATUREZA_ID` e `BLING_ENV_PROBE_NFE_ID`.
- [ ] Ids das formas de pagamento de produção.
- [ ] Conferir `SHIPPING_SENDER_IE` e `MELHOR_ENVIO_ENV=production`.

## Código e deploy

- [ ] Registrar o cron em `vercel.json`. A Vercel só roda cron no deploy de produção, por isso ele fica fora da
      entrega em teste; lá, a rota é chamada à mão.

      ```json
      "crons": [{ "path": "/api/cron/bling-refresh", "schedule": "0 9 * * *" }]
      ```

- [ ] Validar na virada a proteção de ambiente da §3 da spec: o `404` da sonda não pode ser testado sem trocar o
      ambiente da conta.
- [ ] Rodar o agente `security-reviewer` e registrar o resultado em `docs/seguranca.md`.
- [ ] Documentar as variáveis no `README.md`.

## Primeira nota em produção

- [ ] Pedido real de baixo valor, com acompanhamento.
- [ ] Consultar a chave no Portal da NF-e.
- [ ] Acompanhar até a postagem.
