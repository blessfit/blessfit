-- Pesquisa "Próximas peças" (docs/spec-proximas-pecas.md): uma linha por resposta.
-- Só o back-end (chave secreta) lê e escreve. As opções válidas são conferidas no servidor (src/data/survey.ts).
create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  campaign text not null,
  who text not null check (who in ('f', 'm', 'a')),
  pieces text[] not null check (cardinality(pieces) between 1 and 20),
  colors text[] not null check (cardinality(colors) between 1 and 4),
  other_color text check (char_length(other_color) <= 40),
  pattern text not null check (pattern in ('liso', 'estampa', 'tanto')),
  size text not null check (size in ('PP', 'P', 'M', 'G', 'GG')),
  price_range text not null,
  activities text[] not null default '{}' check (cardinality(activities) <= 10),
  -- contato: só gravado com consentimento
  name text check (char_length(name) <= 60),
  phone text check (phone ~ '^[0-9]{10,11}$'), -- só dígitos, com DDD
  email text check (char_length(email) <= 254),
  consent boolean not null default false,
  consent_at timestamptz,
  consent_text text, -- versão do texto aceito
  check (not consent or (consent_at is not null and consent_text is not null)),
  check ((phone is null and email is null and name is null) or consent),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.survey_responses enable row level security; -- sem policies: só o back-end

create index survey_responses_campaign_idx on public.survey_responses (campaign, created_at desc);

-- uma resposta por contato em cada campanha: vale a primeira; as seguintes são ignoradas
create unique index survey_responses_phone_uq on public.survey_responses (campaign, phone);
create unique index survey_responses_email_uq on public.survey_responses (campaign, email);
