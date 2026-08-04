create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists public.chipma_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'spam')),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 254),
  company text check (company is null or char_length(company) <= 120),
  message text check (message is null or char_length(message) <= 1000),
  configuration jsonb not null,
  quoted_total_cents integer not null check (quoted_total_cents >= 0),
  pricing_version text not null,
  source_hash text not null check (source_hash ~ '^[a-f0-9]{64}$'),
  user_agent text check (user_agent is null or char_length(user_agent) <= 500),
  origin text check (origin is null or char_length(origin) <= 255),
  consent_at timestamptz not null
);

comment on table public.chipma_inquiries is
  'Validated contact requests from the public ChipMa configurator.';
comment on column public.chipma_inquiries.source_hash is
  'SHA-256 request fingerprint used only for abuse prevention; raw IP addresses are not stored.';
comment on column public.chipma_inquiries.quoted_total_cents is
  'Server-calculated, non-binding website quote in euro cents.';

alter table public.chipma_inquiries enable row level security;
alter table public.chipma_inquiries force row level security;

revoke all on table public.chipma_inquiries from public, anon, authenticated;
grant select, insert, update, delete on table public.chipma_inquiries to service_role;

drop policy if exists deny_anonymous_inquiry_access on public.chipma_inquiries;
create policy deny_anonymous_inquiry_access
  on public.chipma_inquiries
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists deny_authenticated_inquiry_access on public.chipma_inquiries;
create policy deny_authenticated_inquiry_access
  on public.chipma_inquiries
  for all
  to authenticated
  using (false)
  with check (false);

revoke all on function public.rls_auto_enable() from public, anon, authenticated;

create index chipma_inquiries_created_at_idx
  on public.chipma_inquiries (created_at desc);
create index chipma_inquiries_source_hash_created_at_idx
  on public.chipma_inquiries (source_hash, created_at desc);

create or replace function private.calculate_chipma_total_cents(config jsonb)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  quantity integer;
  basis_per_unit_cents integer;
  per_unit_surcharge_cents integer := 0;
  fixed_surcharge_cents integer := 0;
  subtotal_cents integer;
begin
  if jsonb_typeof(config) <> 'object' then
    raise exception using errcode = '22023', message = 'invalid_configuration';
  end if;

  if coalesce(config->>'quantity', '') !~ '^[0-9]+$' then
    raise exception using errcode = '22023', message = 'invalid_quantity';
  end if;

  quantity := (config->>'quantity')::integer;
  if quantity < 25 or quantity > 2000 then
    raise exception using errcode = '22023', message = 'invalid_quantity';
  end if;

  if coalesce(config->>'shape', '') not in
    ('rund', 'sechs', 'quadrat', 'wappen', 'herz', 'kontur')
    or coalesce(config->>'size', '') not in ('23', '25', '30', '35')
    or coalesce(config->>'primaryColor', '') not in
      ('Schwarz', 'Weiß', 'Grau', 'Rot', 'Orange', 'Gelb', 'Hellgrün',
       'Dunkelgrün', 'Türkis', 'Blau', 'Violett', 'Pink', 'Gold')
    or coalesce(config->>'secondaryColor', '') not in
      ('Schwarz', 'Weiß', 'Grau', 'Rot', 'Orange', 'Gelb', 'Hellgrün',
       'Dunkelgrün', 'Türkis', 'Blau', 'Violett', 'Pink', 'Gold')
    or coalesce(config->>'motif', '') not in ('text', 'logo', 'beides')
    or coalesce(config->>'font', '') not in ('sans', 'block', 'mono')
    or coalesce(config->>'embossing', '') not in ('erhaben', 'vertieft', 'keine')
    or coalesce(config->>'personalizationType', '') not in ('nummer', 'namen', 'datum')
    or char_length(coalesce(config->>'text', '')) > 20
    or char_length(coalesce(config->>'logoName', '')) > 255
    or jsonb_typeof(config->'twoTone') <> 'boolean'
    or jsonb_typeof(config->'personalization') <> 'boolean'
    or jsonb_typeof(config->'extras') <> 'array'
    or not (config->'extras' <@ '["oese", "oeffner", "box", "spender"]'::jsonb)
  then
    raise exception using errcode = '22023', message = 'invalid_configuration';
  end if;

  basis_per_unit_cents := case
    when quantity < 50 then 120
    when quantity < 100 then 95
    when quantity < 250 then 79
    when quantity < 500 then 65
    when quantity < 1000 then 55
    else 45
  end;

  if config->>'shape' = 'kontur' then
    per_unit_surcharge_cents := per_unit_surcharge_cents + 15;
  end if;
  if (config->>'twoTone')::boolean then
    per_unit_surcharge_cents := per_unit_surcharge_cents + 10;
  end if;
  if (config->>'personalization')::boolean then
    per_unit_surcharge_cents := per_unit_surcharge_cents + 25;
  end if;
  if config->'extras' ? 'oese' then
    per_unit_surcharge_cents := per_unit_surcharge_cents + 5;
  end if;
  if config->'extras' ? 'oeffner' then
    per_unit_surcharge_cents := per_unit_surcharge_cents + 60;
  end if;
  if config->'extras' ? 'box' then
    fixed_surcharge_cents := fixed_surcharge_cents + 1490;
  end if;
  if config->'extras' ? 'spender' then
    fixed_surcharge_cents := fixed_surcharge_cents + 3900;
  end if;
  if quantity < 250 then
    fixed_surcharge_cents := fixed_surcharge_cents + 2900;
  end if;

  subtotal_cents :=
    (basis_per_unit_cents + per_unit_surcharge_cents) * quantity
    + fixed_surcharge_cents;

  return subtotal_cents + case when subtotal_cents < 10000 then 490 else 0 end;
end;
$$;

revoke all on function private.calculate_chipma_total_cents(jsonb) from public, anon, authenticated;
grant execute on function private.calculate_chipma_total_cents(jsonb) to service_role;

create or replace function private.prepare_chipma_inquiry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name := btrim(new.name);
  new.email := lower(btrim(new.email));
  new.company := nullif(btrim(new.company), '');
  new.message := nullif(btrim(new.message), '');

  if char_length(new.name) not between 1 and 80
    or char_length(new.email) not between 3 and 254
    or new.email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or (new.company is not null and char_length(new.company) > 120)
    or (new.message is not null and char_length(new.message) > 1000)
    or new.consent_at is null
    or new.source_hash !~ '^[a-f0-9]{64}$'
  then
    raise exception using errcode = '22023', message = 'invalid_inquiry';
  end if;

  if (
    select count(*)
    from public.chipma_inquiries existing
    where existing.source_hash = new.source_hash
      and existing.created_at >= now() - interval '10 minutes'
  ) >= 5 then
    raise exception using errcode = 'P0001', message = 'rate_limit_exceeded';
  end if;

  new.quoted_total_cents := private.calculate_chipma_total_cents(new.configuration);
  new.pricing_version := 'draft-2026-08-04';
  new.status := 'new';
  return new;
end;
$$;

revoke all on function private.prepare_chipma_inquiry() from public, anon, authenticated;
grant execute on function private.prepare_chipma_inquiry() to service_role;

drop trigger if exists prepare_chipma_inquiry_before_insert on public.chipma_inquiries;

create trigger prepare_chipma_inquiry_before_insert
before insert on public.chipma_inquiries
for each row execute function private.prepare_chipma_inquiry();
