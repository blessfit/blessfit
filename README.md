# blessfit

Loja da **Blessfit** — moda fitness com conforto, performance e estilo.
Venda simples pelo WhatsApp: o botão “Comprar” e a sacola abrem a conversa já com produto, cor, tamanho e valor.

Produção: https://blessfit.vercel.app (deploy automático a cada push na `main`).

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000 (site + rotas /api)
npm run build      # checa os tipos e gera a versão de produção em .next/
npm run start      # serve o build localmente
npm run lint
npm run typecheck  # só a checagem de tipos (tsc)
```

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- [styled-components](https://styled-components.com) para os estilos (tema + componentes estilizados)
- Fonte self-hosted: Montserrat (mesma família do logotipo)

## Onde editar

| O quê | Arquivo |
| --- | --- |
| WhatsApp, Instagram, frete grátis, parcelas, Pix, cupom, menu e slides do banner | `src/data/shop.ts` |
| Preços e estoque | Painel **/admin** → Estoque e preços (valores iniciais em `src/data/catalog.ts`) |
| Produtos (conjuntos e peças avulsas): nomes, descrições, cores e tamanhos | `src/data/catalog.ts` |
| Todas as fotos (produtos por cor, banner, categorias) | `src/data/images.ts` + `src/assets/img/` |
| Categorias, benefícios, “Sobre”, avaliações, FAQ, políticas e guia de tamanhos | `src/data/content.ts` |
| Cores, fontes e espaçamentos | `src/styles/theme.ts` |
| Logo vetorizado (blessfit e b.f) | `src/components/ui/Logo/logoPaths.ts` |

### Coleções

| Linha | Conjuntos | Peças avulsas |
| --- | --- | --- |
| Feminino | Maré, Aurora, Brisa | Top Maré, Shorts Maré, Regata Brisa, Legging Brisa |
| Masculino | Impulso, Fôlego | Camiseta Impulso, Shorts Impulso, Regata Fôlego |

Cada cor de produto tem as próprias fotos: ao trocar a cor no site, as imagens trocam junto.
Para adicionar fotos novas, salve-as como `nome-900.webp` e `nome-1600.webp` numa pasta em
`src/assets/img/` e cadastre-as em `src/data/images.ts`.

## Back-end: pagamento pela InfinitePay

Rotas do Next em `src/app/api/` (lógica em `src/server/`), com os pedidos salvos no Supabase (tabelas em `supabase/migrations/`).
O total é sempre recalculado no servidor com os preços e o estoque do painel; cada venda paga dá baixa no estoque.

| Rota | O que faz |
| --- | --- |
| `POST /api/checkout` | Recebe `{ method: "card" ou "pix", lines: [{ id, color, size, qty }] }`, salva o pedido e devolve `{ orderId, url }` com o link de pagamento |
| `POST /api/infinitepay-webhook` | Aviso de pagamento da InfinitePay. Confirma em `/payment_check` antes de marcar o pedido como pago |
| `GET /api/order?id=…` | Situação do pedido. Na volta do checkout, repasse `transaction_nsu` e `slug` para confirmar na hora |

Status do pedido: `pending` → `paid` → `shipped` → `delivered` (os dois últimos marcados no painel); `review` quando o valor ou a forma de pagamento não bate com o
pedido (ex.: link com preço de Pix pago no cartão); `canceled` se o link não pôde ser criado.

Variáveis de ambiente (na Vercel e em `.env.local`; `npm run dev` já lê o `.env.local`):

| Variável | Valor |
| --- | --- |
| `INFINITEPAY_HANDLE` | InfiniteTag da loja, sem o `$` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto no Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | Chave secreta (`sb_secret_…`), só no servidor |
| `ADMIN_EMAILS` | E-mails com acesso ao painel, separados por vírgula |
| `SITE_URL` | Opcional: domínio público (padrão: o domínio da requisição) |

## Painel /admin

- **Pedidos**: em andamento (pagos, a conferir, enviados) ou por status; itens, cliente, comprovante e troca de status.
- **Estoque e preços**: preço no cartão, no Pix e “de”, produto à venda ou não, e estoque por cor × tamanho
  (em branco = sem controle; 0 = esgotado no site). Lista do que repor no topo.

O site lê preços e estoque do banco (atualiza na hora em que o painel salva, ou a cada minuto).
Sem banco configurado, usa os valores de `src/data/catalog.ts`.

Acesso: crie o usuário em Supabase → Authentication → Users → **Add user** (e desligue “Allow new users to sign up”
em Authentication → Sign In / Providers) e coloque o e-mail em `ADMIN_EMAILS`.

## Estrutura

```
src/
├── app/                  # rotas do Next: loja, admin/ (painel) e api/ (checkout, webhook, pedidos)
├── server/               # código só do servidor: InfinitePay, pedidos, Supabase e login do painel
├── views/Store/          # composição das seções da loja
├── sections/             # banner, lançamentos, categorias, conjuntos, peças avulsas, sobre, avaliações, FAQ
├── components/
│   ├── layout/           # faixa de benefícios, header com busca, gavetas (menu, sacola, favoritos), rodapé
│   ├── product/          # card de produto, card de conjunto, janela “visualizar”
│   └── ui/               # Button, Carousel, Dialog, Swatches, SizePicker, PriceTag, Icons, Logo...
├── store/                # estado da loja: sacola e favoritos (salvos no navegador)
├── lib/                  # links do WhatsApp, pedidos e formatação de preço
├── data/                 # conteúdo editável (loja, catálogo, imagens, textos)
├── styles/               # theme, GlobalStyle, media queries, mixins
└── assets/               # imagens
```

## Antes de divulgar

- [x] Número de WhatsApp em `SHOP.whatsapp`: (37) 99959-9655
- [x] Instagram em `SHOP.instagram`: @blessfit_ep
- [ ] Revisar preços, avaliações, FAQ, política de troca, entrega e guia de tamanhos com os dados reais
- [ ] Em `src/app/layout.tsx`, trocar `metadataBase` pelo domínio oficial (ou definir `SITE_URL`)
