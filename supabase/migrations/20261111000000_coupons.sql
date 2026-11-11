-- Cupons cadastrados pelo painel (docs/spec-cupons.md §1). Usos = pedidos pagos com o código: sem contador.
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
