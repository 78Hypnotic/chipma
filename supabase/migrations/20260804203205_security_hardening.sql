create table if not exists private.chipma_inquiry_rate_limits (
  source_hash text primary key
    check (source_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null
    check (request_count between 1 and 6),
  updated_at timestamptz not null
);

comment on table private.chipma_inquiry_rate_limits is
  'Atomic, server-authoritative abuse counters for public inquiry submissions.';

revoke all on table private.chipma_inquiry_rate_limits
  from public, anon, authenticated;
grant select, insert, update, delete
  on table private.chipma_inquiry_rate_limits
  to service_role;

create index if not exists chipma_inquiry_rate_limits_updated_at_idx
  on private.chipma_inquiry_rate_limits (updated_at);

create or replace function private.consume_chipma_inquiry_rate_limit(
  fingerprint text,
  requested_at timestamptz default clock_timestamp()
)
returns boolean
language plpgsql
volatile
set search_path = ''
as $$
declare
  current_count integer;
begin
  if fingerprint !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'invalid_source_hash';
  end if;

  insert into private.chipma_inquiry_rate_limits as rate_limit (
    source_hash,
    window_started_at,
    request_count,
    updated_at
  )
  values (fingerprint, requested_at, 1, requested_at)
  on conflict (source_hash) do update
  set
    window_started_at = case
      when rate_limit.window_started_at <= requested_at - interval '10 minutes'
        then requested_at
      else rate_limit.window_started_at
    end,
    request_count = case
      when rate_limit.window_started_at <= requested_at - interval '10 minutes'
        then 1
      else rate_limit.request_count + 1
    end,
    updated_at = requested_at
  returning request_count into current_count;

  return current_count <= 5;
end;
$$;

revoke all on function private.consume_chipma_inquiry_rate_limit(text, timestamptz)
  from public, anon, authenticated;
grant execute on function private.consume_chipma_inquiry_rate_limit(text, timestamptz)
  to service_role;

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

  if not private.consume_chipma_inquiry_rate_limit(new.source_hash) then
    raise exception using errcode = 'P0001', message = 'rate_limit_exceeded';
  end if;

  new.quoted_total_cents := private.calculate_chipma_total_cents(new.configuration);
  new.pricing_version := 'draft-2026-08-04';
  new.status := 'new';
  return new;
end;
$$;

revoke all on table public.chipma_inquiries from authenticated;
grant select on table public.chipma_inquiries to authenticated;
grant update (status) on table public.chipma_inquiries to authenticated;

drop policy if exists deny_authenticated_inquiry_access
  on public.chipma_inquiries;

drop policy if exists chipma_admin_select_inquiries
  on public.chipma_inquiries;
create policy chipma_admin_select_inquiries
  on public.chipma_inquiries
  for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists chipma_admin_update_inquiry_status
  on public.chipma_inquiries;
create policy chipma_admin_update_inquiry_status
  on public.chipma_inquiries
  for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
