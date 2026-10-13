-- Linha do tempo dos pedidos: cada mudança de status (do checkout, do webhook ou do painel) vira um evento.
create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  created_at timestamptz not null default now()
);

alter table public.order_events enable row level security; -- sem policies: só o back-end lê

create index order_events_order_id_idx on public.order_events (order_id, created_at);

create function public.log_order_status() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_events (order_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

revoke execute on function public.log_order_status() from public, anon, authenticated;

create trigger orders_log_status
  after insert or update of status on public.orders
  for each row execute function public.log_order_status();
