-- Monthly food packages replace individual dishes for student-facing food subscriptions.

create table if not exists food_packages (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  package_type text not null check (
    package_type in (
      'breakfast_lunch_dinner',
      'breakfast_lunch',
      'breakfast_dinner',
      'lunch_dinner'
    )
  ),
  name text not null,
  monthly_price integer not null check (monthly_price >= 0),
  max_subscribers integer not null check (max_subscribers >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, package_type)
);

alter table food_packages enable row level security;

create policy "enabled food packages are publicly readable" on food_packages
  for select using (
    is_enabled
    or exists (
      select 1 from restaurants
      where restaurants.id = food_packages.restaurant_id
        and restaurants.owner_profile_id = auth.uid()
    )
  );

create policy "restaurant owners can insert food packages" on food_packages
  for insert with check (
    exists (
      select 1 from restaurants
      where restaurants.id = food_packages.restaurant_id
        and restaurants.owner_profile_id = auth.uid()
    )
  );

create policy "restaurant owners can update food packages" on food_packages
  for update using (
    exists (
      select 1 from restaurants
      where restaurants.id = food_packages.restaurant_id
        and restaurants.owner_profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from restaurants
      where restaurants.id = food_packages.restaurant_id
        and restaurants.owner_profile_id = auth.uid()
    )
  );

insert into food_packages (restaurant_id, package_type, name, monthly_price, max_subscribers, is_enabled)
select restaurants.id, defaults.package_type, defaults.name, defaults.monthly_price, 30, true
from restaurants
cross join (
  values
    ('breakfast_lunch_dinner', 'Breakfast + Lunch + Dinner', 180000),
    ('breakfast_lunch', 'Breakfast + Lunch', 125000),
    ('breakfast_dinner', 'Breakfast + Dinner', 130000),
    ('lunch_dinner', 'Lunch + Dinner', 140000)
) as defaults(package_type, name, monthly_price)
on conflict (restaurant_id, package_type) do nothing;

with ranked_duplicate_requests as (
  select
    id,
    row_number() over (
      partition by profile_id, service_type, service_id
      order by updated_at desc, created_at desc, id desc
    ) as duplicate_rank
  from requests
  where service_type = 'food'
    and status in ('pending', 'confirmed', 'completed')
)
update requests
set status = 'cancelled', updated_at = now()
from ranked_duplicate_requests
where requests.id = ranked_duplicate_requests.id
  and ranked_duplicate_requests.duplicate_rank > 1;

drop index if exists requests_active_provider_unique;

create unique index if not exists requests_active_provider_unique
  on requests (profile_id, service_type, service_id)
  where service_type in ('tutor', 'hostel', 'food', 'transportation')
    and status in ('pending', 'confirmed', 'completed');

drop policy if exists "requests are owner-insertable" on requests;

create policy "requests are owner-insertable" on requests
  for insert with check (
    auth.uid() = profile_id
    and (
      service_type <> 'food'
      or exists (
        select 1 from food_packages
        where food_packages.id = requests.service_id
          and food_packages.is_enabled
      )
    )
    and not (
      service_type = 'tutor'
      and exists (select 1 from tutors where tutors.owner_profile_id = auth.uid())
    )
    and not (
      service_type = 'hostel'
      and exists (select 1 from hostels where hostels.owner_profile_id = auth.uid())
    )
    and not (
      service_type = 'food'
      and exists (select 1 from restaurants where restaurants.owner_profile_id = auth.uid())
    )
    and not (
      service_type = 'transportation'
      and exists (select 1 from transportation_routes where transportation_routes.driver_id = auth.uid())
    )
  );

drop policy if exists "restaurant owners can read requests for their listing" on requests;
drop policy if exists "restaurant owners can update requests for their listing" on requests;

create policy "restaurant owners can read requests for their listing" on requests
  for select using (
    service_type = 'food' and exists (
      select 1 from food_packages
      join restaurants on restaurants.id = food_packages.restaurant_id
      where food_packages.id = requests.service_id
        and restaurants.owner_profile_id = auth.uid()
    )
  );

create policy "restaurant owners can update requests for their listing" on requests
  for update using (
    service_type = 'food' and exists (
      select 1 from food_packages
      join restaurants on restaurants.id = food_packages.restaurant_id
      where food_packages.id = requests.service_id
        and restaurants.owner_profile_id = auth.uid()
    )
  )
  with check (
    service_type = 'food' and exists (
      select 1 from food_packages
      join restaurants on restaurants.id = food_packages.restaurant_id
      where food_packages.id = requests.service_id
        and restaurants.owner_profile_id = auth.uid()
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
    join public.food_packages
      on food_packages.id = requests.service_id
     and requests.service_type = 'food'
    join public.restaurants
      on restaurants.id = food_packages.restaurant_id
    where requests.profile_id = p_profile_id
      and restaurants.owner_profile_id = auth.uid()
  );
$$;

create or replace function public.confirm_food_package_request(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_request public.requests;
  target_package_id uuid;
  capacity integer;
  active_count integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  select service_id into target_package_id
  from public.requests
  where id = p_request_id
    and service_type = 'food'
    and status = 'pending';

  if target_package_id is null then
    raise exception 'Request not found or already handled.';
  end if;

  select food_packages.max_subscribers into capacity
  from public.food_packages
  join public.restaurants on restaurants.id = food_packages.restaurant_id
  where food_packages.id = target_package_id
    and restaurants.owner_profile_id = auth.uid()
  for update of food_packages;

  if capacity is null then
    raise exception 'You do not manage this package.';
  end if;

  select count(*) into active_count
  from public.requests
  where service_type = 'food'
    and service_id = target_package_id
    and status = 'confirmed';

  if active_count >= capacity then
    raise exception 'This package is already at subscriber capacity.';
  end if;

  update public.requests
  set status = 'confirmed', updated_at = now(), seen_by_student = false
  where id = p_request_id
  returning * into updated_request;

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
    and service_type in ('tutor', 'hostel', 'food', 'transportation')
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
        from public.food_packages
        join public.restaurants on restaurants.id = food_packages.restaurant_id
        where requests.service_type = 'food'
          and food_packages.id = requests.service_id
          and restaurants.owner_profile_id = auth.uid()
      )
      or exists (
        select 1
        from public.transportation_routes
        where requests.service_type = 'transportation'
          and transportation_routes.id = requests.service_id
          and transportation_routes.driver_id = auth.uid()
      )
    )
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be completed by this owner.';
  end if;

  return updated_request;
end;
$$;

revoke all on function public.confirm_food_package_request(uuid) from public;
grant execute on function public.confirm_food_package_request(uuid) to authenticated;
