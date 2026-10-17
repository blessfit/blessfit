-- Frete: valor cobrado, endereço e CPF do cliente, e a etiqueta do Melhor Envio (docs/spec-frete.md §7).
alter table public.orders
  add column items_total_cents integer,
  add column shipping_cents integer not null default 0 check (shipping_cents >= 0),
  add column shipping jsonb,          -- cópia da opção escolhida: serviço, preço, custo, prazo, pacote, origem da cotação
  add column shipping_address jsonb,  -- dado pessoal: não vai para log
  add column customer_cpf text check (customer_cpf ~ '^[0-9]{11}$'),
  add column nfe_key text check (nfe_key ~ '^[0-9]{44}$'),
  add column me_order_id text unique,
  add column label_cost_cents integer,
  add column tracking_code text,
  add column shipping_status text check (shipping_status in ('buying', 'ready', 'failed')),
  add column shipping_error text;

-- pedidos antigos: sem frete, o total é o valor dos itens
update public.orders set items_total_cents = total_cents where items_total_cents is null;
alter table public.orders alter column items_total_cents set not null;
alter table public.orders add constraint orders_total_check check (total_cents = items_total_cents + shipping_cents);
