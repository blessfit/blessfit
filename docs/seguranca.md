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
