create table if not exists public.chipma_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) <= 120),
  company text check (company is null or char_length(company) <= 120),
  phone text check (phone is null or char_length(phone) <= 40),
  billing_street text check (billing_street is null or char_length(billing_street) <= 160),
  billing_postal_code text check (billing_postal_code is null or char_length(billing_postal_code) <= 20),
  billing_city text check (billing_city is null or char_length(billing_city) <= 100),
  billing_country_code text not null default 'DE'
    check (billing_country_code ~ '^[A-Z]{2}$'),
  vat_id text check (vat_id is null or char_length(vat_id) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.chipma_profiles is
  'Customer-owned default billing data. Order records keep independent invoice snapshots.';

alter table public.chipma_profiles enable row level security;
alter table public.chipma_profiles force row level security;

revoke all on table public.chipma_profiles from public, anon, authenticated;
grant select on table public.chipma_profiles to authenticated;
grant update (
  full_name,
  company,
  phone,
  billing_street,
  billing_postal_code,
  billing_city,
  billing_country_code,
  vat_id
) on table public.chipma_profiles to authenticated;
grant select, insert, update, delete on table public.chipma_profiles to service_role;

create policy chipma_profiles_select_own
  on public.chipma_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy chipma_profiles_update_own
  on public.chipma_profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create table if not exists public.chipma_orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending_review'
    check (status in (
      'pending_review',
      'confirmed',
      'production',
      'shipped',
      'completed',
      'cancelled'
    )),
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  billing_company text check (billing_company is null or char_length(billing_company) <= 120),
  billing_street text not null check (char_length(billing_street) between 3 and 160),
  billing_postal_code text not null check (char_length(billing_postal_code) between 2 and 20),
  billing_city text not null check (char_length(billing_city) between 1 and 100),
  billing_country_code text not null default 'DE'
    check (billing_country_code ~ '^[A-Z]{2}$'),
  vat_id text check (vat_id is null or char_length(vat_id) <= 40),
  message text check (message is null or char_length(message) <= 1000),
  configuration jsonb not null,
  quoted_total_cents integer not null check (quoted_total_cents >= 0),
  pricing_version text not null,
  source_hash text not null check (source_hash ~ '^[a-f0-9]{64}$'),
  user_agent text check (user_agent is null or char_length(user_agent) <= 500),
  origin text check (origin is null or char_length(origin) <= 255),
  consent_at timestamptz not null
);

comment on table public.chipma_orders is
  'Validated ChipMa orders with immutable billing snapshots and server-authoritative pricing.';
comment on column public.chipma_orders.user_id is
  'Verified Supabase Auth owner. Null for guest orders until securely claimed by confirmed email.';
comment on column public.chipma_orders.source_hash is
  'SHA-256 request fingerprint used only for abuse prevention; raw IP addresses are not stored.';

alter table public.chipma_orders enable row level security;
alter table public.chipma_orders force row level security;

revoke all on table public.chipma_orders from public, anon, authenticated;
grant select on table public.chipma_orders to authenticated;
grant update (status) on table public.chipma_orders to authenticated;
grant select, insert, update, delete on table public.chipma_orders to service_role;

create index chipma_orders_user_created_at_idx
  on public.chipma_orders (user_id, created_at desc)
  where user_id is not null;
create index chipma_orders_status_created_at_idx
  on public.chipma_orders (status, created_at desc);
create index chipma_orders_created_at_idx
  on public.chipma_orders (created_at desc);

create policy chipma_customers_select_own_orders
  on public.chipma_orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy chipma_admin_select_orders
  on public.chipma_orders
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy chipma_admin_update_order_status
  on public.chipma_orders
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.chipma_admin_settings (
  id text primary key default 'general' check (id = 'general'),
  support_email text not null default 'printmagbr@gmail.com'
    check (char_length(support_email) between 3 and 254),
  order_notification_email text not null default 'printmagbr@gmail.com'
    check (char_length(order_notification_email) between 3 and 254),
  default_country_code text not null default 'DE'
    check (default_country_code ~ '^[A-Z]{2}$'),
  analytics_lookback_days integer not null default 90
    check (analytics_lookback_days between 7 and 365),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.chipma_admin_settings (id)
values ('general')
on conflict (id) do nothing;

alter table public.chipma_admin_settings enable row level security;
alter table public.chipma_admin_settings force row level security;

revoke all on table public.chipma_admin_settings from public, anon, authenticated;
grant select on table public.chipma_admin_settings to authenticated;
grant update (
  support_email,
  order_notification_email,
  default_country_code,
  analytics_lookback_days,
  updated_by
) on table public.chipma_admin_settings to authenticated;
grant select, insert, update, delete on table public.chipma_admin_settings to service_role;

create policy chipma_admin_select_settings
  on public.chipma_admin_settings
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy chipma_admin_update_settings
  on public.chipma_admin_settings
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function private.touch_chipma_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.touch_chipma_updated_at()
  from public, anon, authenticated;

create trigger touch_chipma_profiles_updated_at
before update on public.chipma_profiles
for each row execute function private.touch_chipma_updated_at();

create trigger touch_chipma_orders_updated_at
before update on public.chipma_orders
for each row execute function private.touch_chipma_updated_at();

create trigger touch_chipma_admin_settings_updated_at
before update on public.chipma_admin_settings
for each row execute function private.touch_chipma_updated_at();

create or replace function private.handle_chipma_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.chipma_profiles (id, full_name)
  values (
    new.id,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_chipma_user_created()
  from public, anon, authenticated, service_role;

drop trigger if exists on_chipma_auth_user_created on auth.users;
create trigger on_chipma_auth_user_created
after insert on auth.users
for each row execute function private.handle_chipma_user_created();

insert into public.chipma_profiles (id, full_name)
select
  users.id,
  nullif(btrim(coalesce(users.raw_user_meta_data ->> 'full_name', '')), '')
from auth.users users
on conflict (id) do nothing;

create or replace function public.claim_my_chipma_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  calling_user_id uuid := auth.uid();
  verified_email text;
  claimed_count integer;
begin
  if calling_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  select lower(users.email)
  into verified_email
  from auth.users users
  where users.id = calling_user_id
    and users.email_confirmed_at is not null;

  if verified_email is null then
    return 0;
  end if;

  update public.chipma_orders orders
  set user_id = calling_user_id
  where orders.user_id is null
    and orders.email = verified_email;

  get diagnostics claimed_count = row_count;
  return claimed_count;
end;
$$;

revoke all on function public.claim_my_chipma_orders()
  from public, anon, authenticated, service_role;
grant execute on function public.claim_my_chipma_orders() to authenticated;

create or replace function private.prepare_chipma_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.customer_name := btrim(new.customer_name);
  new.email := lower(btrim(new.email));
  new.phone := nullif(btrim(new.phone), '');
  new.billing_company := nullif(btrim(new.billing_company), '');
  new.billing_street := btrim(new.billing_street);
  new.billing_postal_code := btrim(new.billing_postal_code);
  new.billing_city := btrim(new.billing_city);
  new.billing_country_code := upper(btrim(new.billing_country_code));
  new.vat_id := nullif(btrim(new.vat_id), '');
  new.message := nullif(btrim(new.message), '');

  if char_length(new.customer_name) not between 1 and 120
    or char_length(new.email) not between 3 and 254
    or new.email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or (new.phone is not null and char_length(new.phone) > 40)
    or (new.billing_company is not null and char_length(new.billing_company) > 120)
    or char_length(new.billing_street) not between 3 and 160
    or char_length(new.billing_postal_code) not between 2 and 20
    or char_length(new.billing_city) not between 1 and 100
    or new.billing_country_code !~ '^[A-Z]{2}$'
    or (new.vat_id is not null and char_length(new.vat_id) > 40)
    or (new.message is not null and char_length(new.message) > 1000)
    or new.consent_at is null
    or new.source_hash !~ '^[a-f0-9]{64}$'
  then
    raise exception using errcode = '22023', message = 'invalid_order';
  end if;

  if new.user_id is not null and not exists (
    select 1
    from auth.users users
    where users.id = new.user_id
      and lower(users.email) = new.email
  ) then
    raise exception using errcode = '22023', message = 'invalid_order_owner';
  end if;

  if not private.consume_chipma_inquiry_rate_limit(new.source_hash) then
    raise exception using errcode = 'P0001', message = 'rate_limit_exceeded';
  end if;

  new.quoted_total_cents := private.calculate_chipma_total_cents(new.configuration);
  new.pricing_version := 'draft-2026-08-04';
  new.status := 'pending_review';
  return new;
end;
$$;

revoke all on function private.prepare_chipma_order()
  from public, anon, authenticated, service_role;

create trigger prepare_chipma_order_before_insert
before insert on public.chipma_orders
for each row execute function private.prepare_chipma_order();
