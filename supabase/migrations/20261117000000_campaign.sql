-- Configurações da loja editadas pelo painel. Primeira chave: 'campaign' (Black Friday ligada/desligada).
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
-- o site lê com a chave pública (igual a preços e estoque); só a chave secreta (painel) escreve
create policy "Configurações são públicas" on public.site_settings for select to anon, authenticated using (true);
revoke insert, update, delete on public.site_settings from anon, authenticated;

insert into public.site_settings (key, value) values ('campaign', '{"blackFriday": false, "endsAt": null}');

-- Promoção aplicada no pedido (ex.: 'black-friday-blusas-15'). null = sem promoção.
alter table public.orders add column promo text;
