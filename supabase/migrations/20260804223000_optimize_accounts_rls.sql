drop policy if exists chipma_customers_select_own_orders on public.chipma_orders;
drop policy if exists chipma_admin_select_orders on public.chipma_orders;

create policy chipma_orders_select_authorized
  on public.chipma_orders
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists chipma_admin_update_order_status on public.chipma_orders;

create policy chipma_admin_update_order_status
  on public.chipma_orders
  for update
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists chipma_admin_select_settings on public.chipma_admin_settings;
drop policy if exists chipma_admin_update_settings on public.chipma_admin_settings;

create policy chipma_admin_select_settings
  on public.chipma_admin_settings
  for select
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy chipma_admin_update_settings
  on public.chipma_admin_settings
  for update
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create index if not exists chipma_admin_settings_updated_by_idx
  on public.chipma_admin_settings (updated_by)
  where updated_by is not null;
