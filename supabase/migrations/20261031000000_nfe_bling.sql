-- NF-e pelo painel via Bling: estado da nota no pedido e tokens da conexão (docs/spec-nfe-bling.md §5).
alter table public.orders
  add column bling_nfe_id text unique,
  add column nfe_status text check (nfe_status in ('issuing', 'processing', 'authorized', 'rejected', 'blocked')),
  add column nfe_error text,
  add column nfe_danfe_url text,  -- traz accessKey, que dá acesso ao documento: não vai para log
  add column nfe_updated_at timestamptz;  -- última mudança de nfe_status: libera emissão travada por queda

create table public.bling_auth (
  id boolean primary key default true check (id),  -- linha única
  access_token text not null,                      -- criptografado (AES-GCM, BLING_TOKEN_KEY)
  refresh_token text not null,                     -- criptografado: permite emitir notas em nome da empresa
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  refreshing_until timestamptz,                    -- trava: duas requisições não renovam juntas
  updated_at timestamptz not null default now()
);
alter table public.bling_auth enable row level security;  -- sem policies: só a chave secreta acessa
revoke all on public.bling_auth from anon, authenticated;
