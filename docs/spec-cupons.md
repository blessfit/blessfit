# Spec de implementação — Cupons pelo painel

> Status: **spec, não implementada** · 10/11/2026. Fazer numa branch separada (`feat/cupons`), depois dos testes
> de NF-e.
>
> Hoje os cupons ficam fixos em `src/server/coupons.ts` (lista vazia = cupons desligados). Esta spec move os
> cupons para o banco, com cadastro no painel e limite de usos.

## 0. Decisões tomadas

| Assunto | Decisão |
|---|---|
| Onde ficam | Tabela `coupons` no Supabase, editada só pelo painel (`/admin/cupons`). |
| Tipo de desconto | Só **percentual sobre os itens**, como hoje. O frete nunca tem desconto. |
| Quando conta um uso | Quando o pedido é **pago**. Carrinho abandonado ou pedido cancelado não gasta o cupom. |
| Corrida no último uso | **Opção A**: o limite é conferido no checkout. Se duas pessoas pagarem juntas o último uso, as duas compras valem e o cupom fica 1 uso acima do limite. O painel mostra o excesso. Sem reserva. |
| Contador | **Não há coluna de contador.** Usos = pedidos pagos com aquele `coupon_code` (status em `SOLD`). Não precisa mexer no webhook e não dessincroniza. |
| Primeira compra | Vira opção por cupom (`first_purchase_only`), ligada por padrão. |
| Apagar cupom | Não existe. O cupom é **desligado** (`active = false`), para manter o histórico dos pedidos. |
| Código | Maiúsculas, letras e números, 3 a 20 caracteres, único. Não pode ser alterado depois de criado. |

## 1. Banco

Migration `supabase/migrations/2026111xxxxxxx_coupons.sql`:

```sql
create table public.coupons (
  code text primary key check (code ~ '^[A-Z0-9]{3,20}$'),
  percent int not null check (percent between 1 and 90),
  max_uses int check (max_uses is null or max_uses > 0),  -- null = sem limite
  first_purchase_only boolean not null default true,
  starts_at timestamptz,                                  -- null = já vale
  ends_at timestamptz,                                    -- null = sem fim
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
alter table public.coupons enable row level security;  -- sem policies: só a chave secreta acessa
revoke all on public.coupons from anon, authenticated;

create index orders_coupon_code_idx on public.orders (coupon_code) where coupon_code is not null;
```

Usos de um cupom:

```sql
select count(*) from orders where coupon_code = $1 and status in ('paid','review','shipped','delivered');
```

O painel lista todos os cupons com os usos numa consulta só (`group by coupon_code`).

## 2. `src/server/coupons.ts`

- `Coupon` passa a ter os campos da tabela.
- `findCoupon(code)` vira assíncrona: lê do banco por `code` (maiúsculas, sem espaços).
- Nova `checkCoupon(coupon, cpf, now)` devolve o motivo da recusa ou `null`, nesta ordem:
  1. `active = false` → "Cupom inválido" (não revelar que existiu).
  2. Antes de `starts_at` ou depois de `ends_at` → "Este cupom não está valendo".
  3. `max_uses` atingido → "Este cupom esgotou".
  4. `first_purchase_only` e o CPF já tem pedido pago → mensagem atual.
- `unitDiscount` e `discountOf` não mudam.
- `/api/coupon` e `/api/checkout` passam a usar `findCoupon` + `checkCoupon`. O checkout continua conferindo
  tudo de novo (o carrinho pode ter ficado aberto).
- Pedido já criado com um cupom que depois foi desligado ou esgotou: **vale** (o cliente já viu o preço no
  link de pagamento).

## 3. Campo de cupom no carrinho

O campo saiu do site no commit `aa01a38` ("remove coupons from the site for now"). Volta em `CartPage.tsx` e
`Cart.styles.ts`, a partir daquele commit (`git show aa01a38 -- src/views/Cart`), ajustado ao carrinho atual:

- Campo "Cupom" com botão **Aplicar**, que consulta `/api/coupon` com o código e o CPF.
- Mostra o desconto na linha do resumo e o total já com ele. O frete não tem desconto.
- Mostra a mensagem da recusa (`checkCoupon`) embaixo do campo, e permite tirar o cupom aplicado.
- O código aplicado vai junto para `/api/checkout`, que confere tudo de novo.

Os textos de divulgação que saíram no mesmo commit (barra de anúncio, `content.ts`, `shop.ts`, pesquisa) **não**
voltam: cada campanha decide onde divulgar o cupom.

## 4. Painel `/admin/cupons`

- Item **Cupons** no `AdminNav`.
- Tabela: código, desconto, usos (`3 / 10`, ou `3` sem limite; em destaque se passar do limite), validade,
  só primeira compra, situação (ativo / desligado / esgotado / vencido / agendado).
- **Novo cupom**: código, percentual, limite (vazio = sem limite), início e fim (opcionais, horário de
  Brasília), só primeira compra.
- **Editar**: tudo menos o código. Baixar o limite abaixo dos usos atuais é permitido (o cupom só esgota).
- **Desligar / Religar**.
- Server actions em `src/app/admin/actions.ts`, com `requireAdmin()` e validação no servidor (as mesmas regras
  dos `check` da tabela, com mensagem em português).

## 5. Testes

**Automatizados:** `checkCoupon` em cada recusa (desligado, antes do início, vencido, esgotado, primeira compra),
cupom sem limite, código em minúsculas aceito, validação das actions.

**Manuais em HML:**

1. Criar cupom com limite 1, usar num pedido e pagar: o painel mostra `1 / 1` e um novo checkout recusa
   "esgotou".
2. Pedido com cupom não pago: não conta uso.
3. Desligar o cupom: o carrinho recusa; um pedido já criado com ele continua pagável.
4. Cupom com fim no passado: recusa "não está valendo".
5. Cupom sem "só primeira compra": o mesmo CPF usa duas vezes.

## 6. Ordem

1. Migration (aplicar em HML; produção só na entrega, **antes** do deploy do código).
2. `coupons.ts` e as duas rotas, com testes. Tirar a lista fixa `COUPONS` (hoje vazia) do código.
3. Campo de cupom no carrinho.
4. Página e actions do painel.
5. Testes manuais, `security-reviewer`, README.
