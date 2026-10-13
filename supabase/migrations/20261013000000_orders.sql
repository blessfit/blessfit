-- Pedidos da loja. Só o back-end (api/, com a chave secreta) lê e escreve: RLS ligado e sem policies.
create table public.orders (
  id uuid primary key default gen_random_uuid(), -- também é o order_nsu enviado à InfinitePay
  status text not null default 'pending' check (status in ('pending', 'paid', 'review', 'canceled')),
  method text not null check (method in ('card', 'pix')),
  items jsonb not null,
  total_cents integer not null check (total_cents > 0),
  customer jsonb,
  checkout_url text,
  invoice_slug text,
  transaction_nsu text unique,
  capture_method text,
  paid_amount_cents integer,
  installments integer,
  receipt_url text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.orders enable row level security;

create index orders_status_created_at_idx on public.orders (status, created_at desc);
