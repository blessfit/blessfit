-- Preços e estoque: o painel /admin edita, o site lê.
-- Nomes, descrições, cores e fotos continuam em src/data/catalog.ts; produto sem linha aqui usa os valores de lá.
create table public.products (
  id text primary key, -- mesmo id de src/data/catalog.ts
  price numeric(10, 2) not null check (price > 0),
  pix numeric(10, 2) not null check (pix > 0),
  compare_at numeric(10, 2) check (compare_at > 0),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.stock (
  product_id text not null,
  color text not null,
  size text not null,
  quantity integer check (quantity >= 0), -- null = sem controle de estoque (sempre disponível)
  updated_at timestamptz not null default now(),
  primary key (product_id, color, size)
);

-- O site lê preços e estoque com a chave pública; só o back-end (chave secreta) escreve.
alter table public.products enable row level security;
alter table public.stock enable row level security;
create policy "Preços são públicos" on public.products for select to anon, authenticated using (true);
create policy "Estoque é público" on public.stock for select to anon, authenticated using (true);

-- Pedidos: status de envio para o painel e controle da baixa de estoque.
alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'paid', 'review', 'shipped', 'delivered', 'canceled'));
alter table public.orders add column stock_applied boolean not null default false;

-- Dá baixa no estoque dos itens de um pedido pago. Roda uma vez só por pedido, mesmo se chamada de novo.
create function public.apply_order_stock(order_id uuid) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
begin
  update public.orders set stock_applied = true where id = order_id and not stock_applied;
  if not found then
    return;
  end if;

  for item in select jsonb_array_elements(o.items) from public.orders o where o.id = order_id loop
    update public.stock
       set quantity = greatest(quantity - (item ->> 'quantity')::int, 0), updated_at = now()
     where product_id = item ->> 'id'
       and color = item ->> 'color'
       and size = item ->> 'size'
       and quantity is not null;
  end loop;
end;
$$;

revoke execute on function public.apply_order_stock(uuid) from public, anon, authenticated;
