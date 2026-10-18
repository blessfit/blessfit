-- Conta do cliente (docs/spec-conta.md). Perfil 1:1 com auth.users; só o back-end lê e grava (RLS sem policies).
create table public.customers (
  id uuid primary key references auth.users on delete cascade,
  name text,
  cpf text,
  phone text,
  address jsonb, -- mesmo formato de orders.shipping_address
  accepted_terms_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers enable row level security;

-- Pedido ligado à conta (null = compra sem conta). Excluir a conta mantém o pedido.
alter table public.orders add column user_id uuid references auth.users on delete set null;
create index orders_user_id_idx on public.orders (user_id, created_at desc);

-- Ao entrar, os pedidos sem conta com o mesmo e-mail (confirmado) passam para o cliente.
create function public.link_guest_orders(p_user uuid, p_email text) returns integer
language sql
set search_path = ''
as $$
  with linked as (
    update public.orders set user_id = p_user
    where user_id is null and lower(customer ->> 'email') = lower(p_email)
    returning 1
  )
  select count(*)::integer from linked
$$;

revoke execute on function public.link_guest_orders(uuid, text) from public, anon, authenticated;
