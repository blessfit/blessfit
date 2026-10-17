-- Frete grátis por produto (painel → Preços): pedido com um produto marcado tem a opção de frete mais barata grátis.
alter table public.products add column free_shipping boolean not null default false;
