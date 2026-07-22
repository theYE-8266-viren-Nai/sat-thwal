create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1
$$;

create or replace function private.driver_can_read_student_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.transportation_registrations tr
    where tr.driver_id = (select auth.uid())
      and tr.student_id = profile_id
  )
$$;

revoke all on function private.current_user_role() from public;
revoke all on function private.current_user_role() from anon;
grant execute on function private.current_user_role() to authenticated;

revoke all on function private.driver_can_read_student_profile(uuid) from public;
revoke all on function private.driver_can_read_student_profile(uuid) from anon;
grant execute on function private.driver_can_read_student_profile(uuid) to authenticated;

drop policy if exists "drivers can read requester profiles" on public.profiles;
drop policy if exists "admins can manage transportation registrations" on public.transportation_registrations;
drop policy if exists "drivers can create own driver profile" on public.driver_profiles;
drop policy if exists "admins can manage driver profiles" on public.driver_profiles;

create policy "drivers can read requester profiles"
  on public.profiles for select
  using (
    (select auth.uid()) = id
    or private.driver_can_read_student_profile(id)
  );

create policy "admins can manage transportation registrations"
  on public.transportation_registrations for all
  using ((select private.current_user_role()) = 'admin')
  with check ((select private.current_user_role()) = 'admin');

create policy "drivers can create own driver profile"
  on public.driver_profiles for insert
  with check (
    (select auth.uid()) = id
    and (select private.current_user_role()) = 'driver'
  );

create policy "admins can manage driver profiles"
  on public.driver_profiles for all
  using ((select private.current_user_role()) = 'admin')
  with check ((select private.current_user_role()) = 'admin');
