-- Fixes infinite recursion in profiles RLS policies by moving cross-table
-- requester visibility checks into security definer functions.

create or replace function public.is_admin_user(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id and role = 'admin'
  );
$$;

create or replace function public.can_read_driver_requester_profile(p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.transportation_registrations
    where driver_id = auth.uid()
      and student_id = p_profile_id
  );
$$;

create or replace function public.can_read_tutor_requester_profile(p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.requests
    join public.tutors
      on tutors.id = requests.service_id
     and requests.service_type = 'tutor'
    where requests.profile_id = p_profile_id
      and tutors.owner_profile_id = auth.uid()
  );
$$;

create or replace function public.can_read_hostel_requester_profile(p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.requests
    join public.hostels
      on hostels.id = requests.service_id
     and requests.service_type = 'hostel'
    where requests.profile_id = p_profile_id
      and hostels.owner_profile_id = auth.uid()
  );
$$;

drop policy if exists "drivers can read requester profiles" on profiles;
drop policy if exists "tutors can read profiles of their requesters" on profiles;
drop policy if exists "hostel owners can read profiles of their requesters" on profiles;

create policy "drivers can read requester profiles"
  on profiles for select
  using (
    auth.uid() = id
    or public.can_read_driver_requester_profile(id)
  );

create policy "tutors can read profiles of their requesters"
  on profiles for select
  using (public.can_read_tutor_requester_profile(id));

create policy "hostel owners can read profiles of their requesters"
  on profiles for select
  using (public.can_read_hostel_requester_profile(id));

drop policy if exists "admins can manage transportation registrations"
  on transportation_registrations;

create policy "admins can manage transportation registrations"
  on transportation_registrations for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

revoke all on function public.is_admin_user(uuid) from public;
revoke all on function public.can_read_driver_requester_profile(uuid) from public;
revoke all on function public.can_read_tutor_requester_profile(uuid) from public;
revoke all on function public.can_read_hostel_requester_profile(uuid) from public;

grant execute on function public.is_admin_user(uuid) to authenticated;
grant execute on function public.can_read_driver_requester_profile(uuid) to authenticated;
grant execute on function public.can_read_tutor_requester_profile(uuid) to authenticated;
grant execute on function public.can_read_hostel_requester_profile(uuid) to authenticated;
