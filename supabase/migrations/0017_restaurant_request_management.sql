-- Adds a "restaurant" profile role and lets a restaurant owner see and
-- respond to requests made against their meals, mirroring the hostel/tutor
-- owner request-management pattern. Food requests reference a meal id, so
-- every check here joins through meals to reach the owning restaurant.

do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_attribute att on att.attrelid = rel.oid and att.attname = 'role'
  where rel.relname = 'profiles'
    and con.contype = 'c'
    and con.conkey = array[att.attnum];

  if constraint_name is not null then
    execute format('alter table profiles drop constraint %I', constraint_name);
  end if;

  alter table profiles
    add constraint profiles_role_check
    check (role in ('student', 'driver', 'admin', 'restaurant'));
end $$;

alter table restaurants
  add column if not exists owner_profile_id uuid references profiles (id) on delete set null;

drop policy if exists "restaurant owners can read requests for their listing" on requests;
create policy "restaurant owners can read requests for their listing" on requests
  for select using (
    service_type = 'food' and exists (
      select 1 from meals
      join restaurants on restaurants.id = meals.restaurant_id
      where meals.id = requests.service_id and restaurants.owner_profile_id = auth.uid()
    )
  );

drop policy if exists "restaurant owners can update requests for their listing" on requests;
create policy "restaurant owners can update requests for their listing" on requests
  for update using (
    service_type = 'food' and exists (
      select 1 from meals
      join restaurants on restaurants.id = meals.restaurant_id
      where meals.id = requests.service_id and restaurants.owner_profile_id = auth.uid()
    )
  )
  with check (
    service_type = 'food' and exists (
      select 1 from meals
      join restaurants on restaurants.id = meals.restaurant_id
      where meals.id = requests.service_id and restaurants.owner_profile_id = auth.uid()
    )
  );

create or replace function public.can_read_restaurant_requester_profile(p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.requests
    join public.meals
      on meals.id = requests.service_id
     and requests.service_type = 'food'
    join public.restaurants
      on restaurants.id = meals.restaurant_id
    where requests.profile_id = p_profile_id
      and restaurants.owner_profile_id = auth.uid()
  );
$$;

drop policy if exists "restaurant owners can read profiles of their requesters" on profiles;
create policy "restaurant owners can read profiles of their requesters"
  on profiles for select
  using (public.can_read_restaurant_requester_profile(id));

revoke all on function public.can_read_restaurant_requester_profile(uuid) from public;
grant execute on function public.can_read_restaurant_requester_profile(uuid) to authenticated;

create or replace function public.mark_request_completed_by_requester(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_request public.requests;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  update public.requests
  set
    requester_completed_at = coalesce(requester_completed_at, now()),
    completed_at = case
      when owner_completed_at is not null then coalesce(completed_at, now())
      else completed_at
    end,
    status = case
      when owner_completed_at is not null then 'completed'
      else status
    end,
    updated_at = now()
  where
    id = p_request_id
    and profile_id = auth.uid()
    and service_type in ('tutor', 'hostel', 'food')
    and status = 'confirmed'
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be completed by this user.';
  end if;

  return updated_request;
end;
$$;

create or replace function public.mark_request_completed_by_owner(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_request public.requests;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  update public.requests
  set
    owner_completed_at = coalesce(owner_completed_at, now()),
    completed_at = case
      when requester_completed_at is not null then coalesce(completed_at, now())
      else completed_at
    end,
    status = case
      when requester_completed_at is not null then 'completed'
      else status
    end,
    updated_at = now()
  where
    id = p_request_id
    and service_type in ('tutor', 'hostel', 'food')
    and status = 'confirmed'
    and (
      exists (
        select 1
        from public.tutors
        where requests.service_type = 'tutor'
          and tutors.id = requests.service_id
          and tutors.owner_profile_id = auth.uid()
      )
      or exists (
        select 1
        from public.hostels
        where requests.service_type = 'hostel'
          and hostels.id = requests.service_id
          and hostels.owner_profile_id = auth.uid()
      )
      or exists (
        select 1
        from public.meals
        join public.restaurants on restaurants.id = meals.restaurant_id
        where requests.service_type = 'food'
          and meals.id = requests.service_id
          and restaurants.owner_profile_id = auth.uid()
      )
    )
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be completed by this owner.';
  end if;

  return updated_request;
end;
$$;

revoke all on function public.mark_request_completed_by_requester(uuid) from public;
revoke all on function public.mark_request_completed_by_owner(uuid) from public;
grant execute on function public.mark_request_completed_by_requester(uuid) to authenticated;
grant execute on function public.mark_request_completed_by_owner(uuid) to authenticated;
