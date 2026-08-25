drop policy if exists chipma_admin_select_inquiries
  on public.chipma_inquiries;
create policy chipma_admin_select_inquiries
  on public.chipma_inquiries
  for select
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists chipma_admin_update_inquiry_status
  on public.chipma_inquiries;
create policy chipma_admin_update_inquiry_status
  on public.chipma_inquiries
  for update
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop index if exists private.chipma_inquiry_rate_limits_updated_at_idx;
