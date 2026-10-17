-- Cupom no checkout: código usado e desconto (só nos itens; o frete não tem desconto).
alter table public.orders
  add column coupon_code text,
  add column discount_cents integer not null default 0 check (discount_cents >= 0);

alter table public.orders drop constraint orders_total_check;
alter table public.orders add constraint orders_total_check
  check (total_cents = items_total_cents - discount_cents + shipping_cents);

-- "primeira compra" do cupom é conferida pelo CPF
create index orders_customer_cpf_idx on public.orders (customer_cpf) where customer_cpf is not null;
