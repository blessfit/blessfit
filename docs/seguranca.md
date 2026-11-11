# Segurança — registro de correções

Histórico dos problemas de segurança encontrados na loja e no painel, o que foi feito em cada um e o que
ainda depende de configuração manual. Para revisar mudanças novas, use o agente
`.claude/agents/security-reviewer.md` e registre aqui o que for corrigido.

Gravidade: **crítico** (dá para roubar dados ou dinheiro agora) · **alto** · **médio** · **baixo**.

---

## Auditoria de 14/10/2026

Escopo: painel `/admin`, server actions, checkout, webhook da InfinitePay, `/api/order`, exportação Excel,
`src/server/`, migrations e banco de produção (testado com a chave pública, só leitura).

### Corrigido no código

#### 1. Preço errado salvo no painel ia direto para a cobrança — médio
- **Problema:** `savePrices` (`src/app/admin/actions.ts`) só recusava valores vazios, zerados ou negativos.
  Um erro de digitação ia direto para o checkout. Foi o que aconteceu no banco: o Conjunto Maré estava com
  **R$ 1.039,90 no cartão** (Pix R$ 129,90, preço “de” R$ 154,80).
- **Correção:** o painel recusa salvar quando:
  - o preço no Pix é maior que o do cartão;
  - o Pix tem mais de 50% de desconto sobre o cartão;
  - o preço “de” é menor ou igual ao preço no cartão.

#### 2. Código só do servidor podia ir parar no navegador — baixo
- **Problema:** nada impedia que um componente `'use client'` importasse arquivos de `src/server/`. Isso
  colocaria no JavaScript público o **preço de custo e os fornecedores** (`pieces.ts`) e a lógica de pedidos.
  A única proteção era um comentário.
- **Correção:** pacote `server-only` instalado e `import 'server-only'` no começo de todos os arquivos de
  `src/server/` (`admin`, `auth`, `export`, `infinitepay`, `orders`, `pieces`, `supabase`). Agora um import
  desses vindo do navegador quebra o build.

#### 3. Sem proteção contra clickjacking e vazamento do id do pedido — baixo
- **Problema:** o site e o painel podiam ser abertos dentro de um iframe de outro site. Assim alguém poderia
  enganar a pessoa logada no painel e fazê-la clicar em “salvar” ou “mudar status”. O id do pedido
  (`/?pedido=…`) também podia ir no `Referer` para sites externos.
- **Correção:** `next.config.ts` manda em todas as rotas:
  `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`,
  `X-Content-Type-Options: nosniff` e `Referrer-Policy: strict-origin-when-cross-origin`.

### Configuração fora do código — resolvida em 14/10/2026

Conferido depois da configuração:
- **Supabase:** `/auth/v1/settings` devolve `disable_signup: true` e `mailer_autoconfirm: false`.
- **Preço:** o Conjunto Maré está em R$ 139,90 no cartão, R$ 129,90 no Pix e R$ 154,80 como preço “de”.
- **Vercel:** em `POST /api/checkout`, as requisições 1 a 10 do minuto voltam 400 (corpo inválido) e a
  partir da 11ª voltam **429**. `POST /admin/login` também é bloqueado, e `GET /admin/login` continua 200.
- **Vercel, 16/10/2026:** `POST /api/proximas-pecas` (pesquisa “Próximas peças”) entrou como condição OR na
  mesma regra de rate limit. O plano Hobby não permite uma segunda regra de rate limit. Conferido em
  produção: as requisições 1 a 10 do minuto passam e, a partir da 11ª, voltam **429**. O limite é 10 por
  minuto por IP, e não os 5 da spec.

| Gravidade | Item | O que foi feito |
|---|---|---|
| ⚠️ Dado | Conjunto Maré com R$ 1.039,90 no cartão | Painel → Preços: corrigir para o valor certo (no catálogo é R$ 139,90). |
| Médio | Cadastro público do Supabase Auth ligado (`disable_signup: false`). Hoje não dá acesso ao painel porque a confirmação de e-mail é obrigatória e o e-mail precisa estar em `ADMIN_EMAILS`. Mas se a confirmação for desligada, qualquer pessoa poderia criar conta com um e-mail de admin que ainda não tenha usuário e entrar. | Supabase → Authentication → Sign In / Providers → desligar “Allow new users to sign up”. Admins novos são convidados em Authentication → Users → Invite. |
| Baixo | Sem limite de requisições em `/api/checkout` e no login. Dá para criar milhares de pedidos `pending` ou tentar senhas em sequência (o Supabase Auth tem um limite próprio). | Vercel → Firewall → regra de rate limit para `POST /api/checkout` e `/admin/login` (ex.: 10 por minuto por IP). |

### Avaliado e sem risco hoje

- **`npm audit`: `uuid < 11.1.1` (moderado), via `exceljs`.** A falha só existe em `uuid` v3/v5/v6 quando a
  função recebe um `buf` próprio. O `exceljs` usa só `v4()` sem buffer, então não é explorável aqui. A
  correção sugerida pelo npm rebaixaria o `exceljs` para a 3.4 (quebra a exportação). Revisar quando o
  `exceljs` atualizar a dependência.
- **Webhook da InfinitePay sem assinatura:** o aviso só dispara a conferência. O pagamento só vale depois
  de `/payment_check`, com valor e forma de pagamento comparados ao pedido. `transaction_nsu` é único, então
  um pagamento não confirma dois pedidos.
- **Preço vindo do navegador:** o checkout recalcula tudo no servidor (`priceCart`) a partir do catálogo e
  do banco.
- **Acesso ao painel:** todas as páginas, server actions e a rota de exportação chamam `requireAdmin()` por
  conta própria. Não dependem do layout.
- **Banco de produção:** `orders` e `order_events` voltam vazios para a chave pública (RLS sem policies).
  `products` e `stock` só permitem leitura. `apply_order_stock` responde “permission denied” para a chave
  pública.
- **Segredos:** nenhum `.env` versionado. A chave secreta só é lida em `src/server/supabase.ts`.
- **Exportação Excel:** dados de clientes entram como texto, não como fórmula. A rota exige admin e usa
  `Cache-Control: no-store`.

---

## Revisão de 16/10/2026: pesquisa “Próximas peças”

Escopo: `/proximas-pecas`, `POST /api/proximas-pecas`, `src/server/survey.ts`, tabela `survey_responses`,
painel `/admin/proximas-pecas` e a exportação Excel da pesquisa. Feita pelo agente `security-reviewer`.
Não houve achado crítico nem alto.

### Corrigido no código

#### 1. Qualquer pessoa podia sobrescrever a resposta de outra — médio
- **Problema:** com o WhatsApp ou o e-mail repetido, a API atualizava a resposta anterior. Quem soubesse o
  contato de outra pessoa podia trocar as respostas e o consentimento dela, apagar o telefone dela ou
  recriar um contato removido pelo painel.
- **Correção:** a resposta agora só é inserida (`saveSurvey`). Contato repetido na campanha bate no índice
  único (`23505`), a resposta nova é ignorada e a API devolve o cupom do mesmo jeito.

#### 2. Contatos ficavam no navegador depois do envio — baixo
- **Problema:** o rascunho no `localStorage`, com nome, WhatsApp e e-mail, continuava lá depois do envio.
- **Correção:** depois do envio, o navegador guarda só que a pesquisa já foi respondida.

#### 3. Corpo do POST lido antes de checar o tamanho — baixo
- **Correção:** a rota recusa com 413 pelo `Content-Length`, antes de ler o corpo.

#### 4. Validação fraca do id em “Remover contato” — baixo
- **Correção:** `anonymizeSurveyContact` exige um uuid completo. Não era explorável, porque a ação já exige
  admin e a consulta é parametrizada.

### Pendente (decisão de negócio)

- **Consentimento sem confirmação:** qualquer pessoa pode informar o número de outra e marcar a
  autorização, porque o contato não é confirmado (não há double opt-in). Antes de usar a lista para
  mandar mensagens, a primeira mensagem deve confirmar o interesse e oferecer a opção de sair.

### Conferido

- A chave pública não lê nem grava em `survey_responses` (RLS sem policies).
- A rota do painel, a ação “Remover contato” e a exportação chamam `requireAdmin()`.
- Os logs não têm dados pessoais.
- Rate limit de 10 por minuto por IP no Firewall da Vercel.

## Revisão de 10/11/2026: NF-e pelo Bling

Escopo: branch `feat/nfe-bling` (`src/server/nfe/`, `/api/bling/callback`, `/api/cron/bling-refresh`, ações e
cartão da NF-e no painel, migration `20261031000000_nfe_bling.sql`). Feita pelo agente `security-reviewer`.
Não houve achado crítico, alto nem médio.

### Corrigido no código

#### 1. Link do DANFE ia para o painel sem validação — baixo
- **Problema:** o `linkDanfe` da resposta do Bling era gravado e virava `href` no painel sem checar esquema
  nem domínio. Só seria explorável com a API do Bling comprometida (link de phishing com cara de DANFE).
- **Correção:** `blingUrl` em `src/server/nfe/bling.ts` só aceita `https` em `bling.com.br` e subdomínios.

#### 2. Chave da nota emitida pelo painel só era protegida na tela — baixo
- **Problema:** o campo da chave fica só leitura com a nota autorizada, mas `createShippingLabel` aceitava
  qualquer chave válida. Chamando a ação direto, um admin trocava a chave de uma nota emitida.
- **Correção:** `generateLabel` recusa chave diferente da gravada quando `nfe_status = 'authorized'`.

#### 3. `src/server/nfe/connection.ts` sem `server-only` — baixo
- **Correção:** import adicionado. O arquivo só tinha constantes, sem segredo.

#### 4. Ajustes informativos
- `releaseInvoice` exige um uuid antes de consultar o banco.
- `issueInvoice` aguarda o `settle` dentro do `try` (`return await`), para uma falha ao gravar cair no
  tratamento de erro da emissão.

### Pendente

- Registrar o cron em `vercel.json` na entrega em produção (`docs/pendencias-prod-nfe.md`). Sem ele, o
  refresh token vence depois de 30 dias sem emissão e é preciso reconectar: afeta disponibilidade, não
  segurança.
- Conferir com a chave pública, depois de aplicar a migration em produção, que `bling_auth` não é legível
  (`permission denied` ou `[]`). A sonda não rodou nesta revisão.

### Conferido

- OAuth: `state` aleatório em cookie HttpOnly de uso único, comparado em tempo constante; callback e
  "Conectar Bling" exigem admin; sem open redirect.
- Tokens cifrados com AES-256-GCM, renovação com trava, nenhum token em log, resposta ou erro.
- Cron: 401 sem `CRON_SECRET`, comparação em tempo constante.
- Ações da NF-e com `requireAdmin()`; valores fiscais vêm só do banco, do catálogo e de `src/data/fiscal.ts`.
- Leitura do XML só em `https://www.bling.com.br`, sem seguir redirecionamento e sem token.
- Logs só com id do pedido e status HTTP. Erros do Bling aparecem como texto, sem HTML.
- `bling_auth` com RLS sem policies e `revoke` de `anon`/`authenticated`; colunas novas de `orders` não saem
  em `/api/order` nem na exportação.

## Revisão de 11/11/2026: cupons pelo painel

Escopo: branch `feat/cupons` (`src/server/coupons.ts`, `/api/coupon`, cupom no `/api/checkout`, ações e página
`/admin/cupons`, campo do carrinho, migration `20261111000000_coupons.sql`). Feita pelo agente
`security-reviewer`. Não houve achado crítico nem alto.

### Corrigido no código

#### 1. `/api/coupon` dizia se um CPF já comprou na loja — médio
- **Problema:** com um cupom "só na primeira compra" conhecido, `POST /api/coupon { code, cpf }` respondia
  "vale só na primeira compra" para quem tinha pedido pago e 200 para quem não tinha. Sem login nem limite de
  requisições, dava para testar uma lista de CPFs (dado pessoal: diz que a pessoa é cliente da loja).
- **Correção:** a prévia do carrinho não confere mais a primeira compra e o carrinho não manda o CPF. Só o
  checkout confere, com o formulário completo.

#### 2. "Só na primeira compra" se contornava trocando o CPF — médio
- **Problema:** a regra olhava só o CPF. O mesmo cliente repetia o cupom com o CPF de um parente ou de um
  gerador (e a NF-e saía no CPF errado).
- **Correção:** o checkout recusa se já há pedido pago com o mesmo CPF, e-mail (sem diferenciar maiúsculas,
  sem curingas no `ilike`), telefone ou conta logada. Continua contornável com todos os dados novos: para
  campanha grande, use também o limite de usos.

#### 3. Mensagens deixavam descobrir cupons agendados — baixo
- **Problema:** "não está valendo" para cupom agendado revelava a campanha antes do lançamento a um robô que
  testasse códigos.
- **Correção:** agendado responde "Cupom inválido", igual a desligado ou inexistente. O painel mostra a
  situação real. O painel orienta usar códigos com 6 ou mais caracteres.

#### 4. Usos contavam pedidos antigos com o mesmo código — informativo
- **Correção:** os usos contam só pedidos feitos depois de o cupom ser criado, então um código recriado começa
  do zero.

### Risco aceito

- **Sem limite de requisições** em `/api/coupon` e `/api/checkout`: dá para testar códigos (cerca de 47 mil
  com 3 caracteres). Mitigado pelas mensagens iguais e pela orientação de códigos longos. Rever se aparecer
  abuso nos logs.
- **Corrida no último uso** (spec §0, opção A): pagamentos juntos no último uso passam todos, e o painel mostra
  o excesso.
- Ações do painel devolvem a mensagem do banco ao admin logado, no mesmo padrão das outras ações.

### Conferido

- `requireAdmin()` na página e nas três ações; o componente do painel não importa nada de `src/server`.
- Entrada das ações validada no servidor sem confiar no formato; o `check` da tabela repete as regras.
- Percentual e desconto vêm só do banco; o checkout recalcula tudo e grava o código vindo do banco.
- `/api/coupon` devolve só `{ code, percent }`; desligado responde igual a inexistente.
- Logs sem CPF nem detalhe do banco; erro ao consultar devolve 503 genérico.
- Filtros do Supabase só com `.eq`/`.ilike`/`.in` parametrizados, sem `.or` montado com texto.
- `coupons` com RLS sem policies e `revoke` de `anon`/`authenticated`.
