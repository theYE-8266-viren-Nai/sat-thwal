-- Moves platform revenue from completed service requests to one-time,
-- admin-confirmed provider registration fees.

create schema if not exists private;

create table if not exists public.provider_fee_schedule (
  provider_type text primary key
    check (provider_type in ('tutor', 'hostel', 'restaurant', 'transportation')),
  amount_mmk integer not null check (amount_mmk > 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.provider_fee_schedule (provider_type, amount_mmk)
values
  ('tutor', 2000),
  ('hostel', 5000),
  ('transportation', 3000),
  ('restaurant', 20000)
on conflict (provider_type) do nothing;

create table if not exists public.provider_registrations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  provider_type text not null
    check (provider_type in ('tutor', 'hostel', 'restaurant', 'transportation')),
  fee_amount_mmk integer not null check (fee_amount_mmk > 0),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'payment_review', 'active', 'suspended')),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, provider_type)
);

create index if not exists provider_registrations_status_idx
  on public.provider_registrations (status, created_at desc);

create table if not exists public.provider_payment_submissions (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null
    references public.provider_registrations (id) on delete cascade,
  amount_mmk integer not null check (amount_mmk > 0),
  payment_method text not null
    check (payment_method in ('kbzpay', 'wavepay', 'bank_transfer', 'other')),
  transaction_reference text not null
    check (length(btrim(transaction_reference)) > 0),
  status text not null default 'submitted'
    check (status in ('submitted', 'paid', 'rejected', 'waived')),
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null
);

create index if not exists provider_payment_submissions_status_idx
  on public.provider_payment_submissions (status, submitted_at desc);

create unique index if not exists provider_payment_one_submitted_idx
  on public.provider_payment_submissions (registration_id)
  where status = 'submitted';

create unique index if not exists provider_payment_one_activation_idx
  on public.provider_payment_submissions (registration_id)
  where status in ('paid', 'waived');

alter table public.provider_fee_schedule enable row level security;
alter table public.provider_registrations enable row level security;
alter table public.provider_payment_submissions enable row level security;

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

create or replace function private.provider_registration_is_active(
  p_profile_id uuid,
  p_provider_type text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.provider_registrations pr
    where pr.profile_id = p_profile_id
      and pr.provider_type = p_provider_type
      and pr.status = 'active'
  )
$$;

create or replace function private.ensure_provider_registration(
  p_profile_id uuid,
  p_provider_type text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration_id uuid;
  registration_fee integer;
begin
  if p_profile_id is null then
    return null;
  end if;

  select pfs.amount_mmk
  into registration_fee
  from public.provider_fee_schedule pfs
  where pfs.provider_type = p_provider_type
    and pfs.is_enabled;

  if registration_fee is null then
    raise exception 'Provider registration is not enabled for %.', p_provider_type;
  end if;

  insert into public.provider_registrations (
    profile_id,
    provider_type,
    fee_amount_mmk
  )
  values (
    p_profile_id,
    p_provider_type,
    registration_fee
  )
  on conflict (profile_id, provider_type) do nothing
  returning id into registration_id;

  if registration_id is null then
    select pr.id
    into registration_id
    from public.provider_registrations pr
    where pr.profile_id = p_profile_id
      and pr.provider_type = p_provider_type;
  end if;

  return registration_id;
end;
$$;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

revoke all on function private.current_user_role() from public;
grant execute on function private.current_user_role() to anon, authenticated;

revoke all on function private.provider_registration_is_active(uuid, text) from public;
grant execute on function private.provider_registration_is_active(uuid, text)
  to anon, authenticated;

revoke all on function private.ensure_provider_registration(uuid, text) from public;
revoke all on function private.ensure_provider_registration(uuid, text) from anon;
revoke all on function private.ensure_provider_registration(uuid, text) from authenticated;

drop policy if exists "provider fees are authenticated readable"
  on public.provider_fee_schedule;
create policy "provider fees are authenticated readable"
  on public.provider_fee_schedule for select
  to authenticated
  using (true);

drop policy if exists "admins can manage provider fees"
  on public.provider_fee_schedule;
create policy "admins can manage provider fees"
  on public.provider_fee_schedule for all
  to authenticated
  using ((select private.current_user_role()) = 'admin')
  with check ((select private.current_user_role()) = 'admin');

drop policy if exists "providers can read own registrations"
  on public.provider_registrations;
create policy "providers can read own registrations"
  on public.provider_registrations for select
  to authenticated
  using ((select auth.uid()) = profile_id);

drop policy if exists "admins can read provider registrations"
  on public.provider_registrations;
create policy "admins can read provider registrations"
  on public.provider_registrations for select
  to authenticated
  using ((select private.current_user_role()) = 'admin');

drop policy if exists "providers can read own payment submissions"
  on public.provider_payment_submissions;
create policy "providers can read own payment submissions"
  on public.provider_payment_submissions for select
  to authenticated
  using (
    exists (
      select 1
      from public.provider_registrations pr
      where pr.id = provider_payment_submissions.registration_id
        and pr.profile_id = (select auth.uid())
    )
  );

drop policy if exists "admins can read provider payment submissions"
  on public.provider_payment_submissions;
create policy "admins can read provider payment submissions"
  on public.provider_payment_submissions for select
  to authenticated
  using ((select private.current_user_role()) = 'admin');

drop policy if exists "admins can read all profiles" on public.profiles;
create policy "admins can read all profiles"
  on public.profiles for select
  to authenticated
  using ((select private.current_user_role()) = 'admin');

-- Existing owned providers stay active, but receive an auditable waiver that
-- is deliberately excluded from received-revenue calculations.
insert into public.provider_registrations (
  profile_id,
  provider_type,
  fee_amount_mmk,
  status,
  activated_at
)
select t.owner_profile_id, 'tutor', pfs.amount_mmk, 'active', now()
from public.tutors t
join public.provider_fee_schedule pfs on pfs.provider_type = 'tutor'
where t.owner_profile_id is not null
on conflict (profile_id, provider_type) do nothing;

insert into public.provider_registrations (
  profile_id,
  provider_type,
  fee_amount_mmk,
  status,
  activated_at
)
select h.owner_profile_id, 'hostel', pfs.amount_mmk, 'active', now()
from public.hostels h
join public.provider_fee_schedule pfs on pfs.provider_type = 'hostel'
where h.owner_profile_id is not null
on conflict (profile_id, provider_type) do nothing;

insert into public.provider_registrations (
  profile_id,
  provider_type,
  fee_amount_mmk,
  status,
  activated_at
)
select r.owner_profile_id, 'restaurant', pfs.amount_mmk, 'active', now()
from public.restaurants r
join public.provider_fee_schedule pfs on pfs.provider_type = 'restaurant'
where r.owner_profile_id is not null
on conflict (profile_id, provider_type) do nothing;

insert into public.provider_registrations (
  profile_id,
  provider_type,
  fee_amount_mmk,
  status,
  activated_at
)
select dp.id, 'transportation', pfs.amount_mmk, 'active', now()
from public.driver_profiles dp
join public.provider_fee_schedule pfs on pfs.provider_type = 'transportation'
on conflict (profile_id, provider_type) do nothing;

insert into public.provider_payment_submissions (
  registration_id,
  amount_mmk,
  payment_method,
  transaction_reference,
  status,
  reviewed_at
)
select
  pr.id,
  pr.fee_amount_mmk,
  'other',
  'legacy-grandfathering',
  'waived',
  now()
from public.provider_registrations pr
where pr.status = 'active'
  and not exists (
    select 1
    from public.provider_payment_submissions pps
    where pps.registration_id = pr.id
      and pps.status in ('paid', 'waived')
  );

alter table public.restaurants
  add column if not exists verified boolean not null default false;

update public.tutors
set verified = true
where owner_profile_id is null
   or private.provider_registration_is_active(owner_profile_id, 'tutor');

update public.hostels
set verified = true
where owner_profile_id is null
   or private.provider_registration_is_active(owner_profile_id, 'hostel');

update public.restaurants
set verified = true
where owner_profile_id is null
   or private.provider_registration_is_active(owner_profile_id, 'restaurant');

update public.transportation_routes
set verified = true
where driver_id is null
   or private.provider_registration_is_active(driver_id, 'transportation');

create or replace function private.create_provider_registration_from_listing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
  registration_type text;
begin
  if tg_table_name = 'tutors' then
    owner_id := new.owner_profile_id;
    registration_type := 'tutor';
  elsif tg_table_name = 'hostels' then
    owner_id := new.owner_profile_id;
    registration_type := 'hostel';
  elsif tg_table_name = 'driver_profiles' then
    owner_id := new.id;
    registration_type := 'transportation';
  elsif tg_table_name = 'restaurants' then
    owner_id := new.owner_profile_id;
    registration_type := 'restaurant';
  else
    raise exception 'Unsupported provider registration source: %', tg_table_name;
  end if;

  perform private.ensure_provider_registration(owner_id, registration_type);
  return new;
end;
$$;

create or replace function private.enforce_provider_publication_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'tutors' and new.owner_profile_id is not null then
    new.verified :=
      private.provider_registration_is_active(new.owner_profile_id, 'tutor');
  elsif tg_table_name = 'hostels' and new.owner_profile_id is not null then
    new.verified :=
      private.provider_registration_is_active(new.owner_profile_id, 'hostel');
  elsif tg_table_name = 'restaurants' and new.owner_profile_id is not null then
    new.verified :=
      private.provider_registration_is_active(new.owner_profile_id, 'restaurant');
  elsif tg_table_name = 'transportation_routes' and new.driver_id is not null then
    new.verified :=
      private.provider_registration_is_active(new.driver_id, 'transportation');
  end if;

  return new;
end;
$$;

create or replace function private.enforce_driver_registration_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
  elsif new.status is distinct from old.status
    and (select auth.uid()) is not null
    and coalesce(private.current_user_role(), '') <> 'admin' then
    raise exception 'Only an administrator can change driver activation status.';
  end if;

  return new;
end;
$$;

create or replace function private.prevent_client_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    if tg_op = 'INSERT' and new.role <> 'student' then
      raise exception 'New client profiles must use the student role.';
    elsif tg_op = 'UPDATE' and new.role is distinct from old.role then
      raise exception 'Account roles can only be changed by a trusted administrator.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tutors_create_provider_registration on public.tutors;
create trigger tutors_create_provider_registration
after insert on public.tutors
for each row
execute function private.create_provider_registration_from_listing();

drop trigger if exists hostels_create_provider_registration on public.hostels;
create trigger hostels_create_provider_registration
after insert on public.hostels
for each row
execute function private.create_provider_registration_from_listing();

drop trigger if exists drivers_create_provider_registration on public.driver_profiles;
create trigger drivers_create_provider_registration
after insert on public.driver_profiles
for each row
execute function private.create_provider_registration_from_listing();

drop trigger if exists restaurants_create_provider_registration on public.restaurants;
create trigger restaurants_create_provider_registration
after insert or update of owner_profile_id on public.restaurants
for each row
when (new.owner_profile_id is not null)
execute function private.create_provider_registration_from_listing();

drop trigger if exists tutors_enforce_publication_state on public.tutors;
create trigger tutors_enforce_publication_state
before insert or update on public.tutors
for each row
execute function private.enforce_provider_publication_state();

drop trigger if exists hostels_enforce_publication_state on public.hostels;
create trigger hostels_enforce_publication_state
before insert or update on public.hostels
for each row
execute function private.enforce_provider_publication_state();

drop trigger if exists restaurants_enforce_publication_state on public.restaurants;
create trigger restaurants_enforce_publication_state
before insert or update on public.restaurants
for each row
execute function private.enforce_provider_publication_state();

drop trigger if exists routes_enforce_publication_state on public.transportation_routes;
create trigger routes_enforce_publication_state
before insert or update on public.transportation_routes
for each row
execute function private.enforce_provider_publication_state();

drop trigger if exists driver_profiles_enforce_registration_status
  on public.driver_profiles;
create trigger driver_profiles_enforce_registration_status
before insert or update of status on public.driver_profiles
for each row
execute function private.enforce_driver_registration_status();

drop trigger if exists profiles_prevent_client_role_change on public.profiles;
create trigger profiles_prevent_client_role_change
before insert or update of role on public.profiles
for each row
execute function private.prevent_client_profile_role_change();

alter table public.driver_profiles alter column status set default 'pending';

drop policy if exists "tutors are publicly readable" on public.tutors;
drop policy if exists "active tutors are readable" on public.tutors;
create policy "active tutors are readable"
  on public.tutors for select
  using (
    owner_profile_id is null
    or (select auth.uid()) = owner_profile_id
    or (select private.current_user_role()) = 'admin'
    or private.provider_registration_is_active(owner_profile_id, 'tutor')
  );

drop policy if exists "hostels are publicly readable" on public.hostels;
drop policy if exists "active hostels are readable" on public.hostels;
create policy "active hostels are readable"
  on public.hostels for select
  using (
    owner_profile_id is null
    or (select auth.uid()) = owner_profile_id
    or (select private.current_user_role()) = 'admin'
    or private.provider_registration_is_active(owner_profile_id, 'hostel')
  );

drop policy if exists "restaurants are publicly readable" on public.restaurants;
drop policy if exists "active restaurants are readable" on public.restaurants;
create policy "active restaurants are readable"
  on public.restaurants for select
  using (
    owner_profile_id is null
    or (select auth.uid()) = owner_profile_id
    or (select private.current_user_role()) = 'admin'
    or private.provider_registration_is_active(owner_profile_id, 'restaurant')
  );

drop policy if exists "meals are publicly readable" on public.meals;
drop policy if exists "active restaurant meals are readable" on public.meals;
create policy "active restaurant meals are readable"
  on public.meals for select
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = meals.restaurant_id
        and (
          r.owner_profile_id is null
          or (select auth.uid()) = r.owner_profile_id
          or (select private.current_user_role()) = 'admin'
          or private.provider_registration_is_active(
            r.owner_profile_id,
            'restaurant'
          )
        )
    )
  );

drop policy if exists "transportation routes are publicly readable"
  on public.transportation_routes;
drop policy if exists "active transportation routes are readable"
  on public.transportation_routes;
create policy "active transportation routes are readable"
  on public.transportation_routes for select
  using (
    driver_id is null
    or (select auth.uid()) = driver_id
    or (select private.current_user_role()) = 'admin'
    or private.provider_registration_is_active(driver_id, 'transportation')
  );

drop policy if exists "drivers can update own transportation routes"
  on public.transportation_routes;
drop policy if exists "active drivers can update own transportation routes"
  on public.transportation_routes;
create policy "active drivers can update own transportation routes"
  on public.transportation_routes for update
  to authenticated
  using (
    (select auth.uid()) = driver_id
    and private.provider_registration_is_active(driver_id, 'transportation')
  )
  with check (
    (select auth.uid()) = driver_id
    and private.provider_registration_is_active(driver_id, 'transportation')
  );

drop policy if exists "tutors can read requests for their listing"
  on public.requests;
drop policy if exists "active tutors can read requests for their listing"
  on public.requests;
create policy "active tutors can read requests for their listing"
  on public.requests for select
  to authenticated
  using (
    service_type = 'tutor'
    and private.provider_registration_is_active((select auth.uid()), 'tutor')
    and exists (
      select 1
      from public.tutors t
      where t.id = requests.service_id
        and t.owner_profile_id = (select auth.uid())
    )
  );

drop policy if exists "tutors can update requests for their listing"
  on public.requests;
drop policy if exists "active tutors can update requests for their listing"
  on public.requests;
create policy "active tutors can update requests for their listing"
  on public.requests for update
  to authenticated
  using (
    service_type = 'tutor'
    and private.provider_registration_is_active((select auth.uid()), 'tutor')
    and exists (
      select 1
      from public.tutors t
      where t.id = requests.service_id
        and t.owner_profile_id = (select auth.uid())
    )
  )
  with check (
    service_type = 'tutor'
    and private.provider_registration_is_active((select auth.uid()), 'tutor')
    and exists (
      select 1
      from public.tutors t
      where t.id = requests.service_id
        and t.owner_profile_id = (select auth.uid())
    )
  );

drop policy if exists "hostel owners can read requests for their listing"
  on public.requests;
drop policy if exists "active hostel owners can read requests for their listing"
  on public.requests;
create policy "active hostel owners can read requests for their listing"
  on public.requests for select
  to authenticated
  using (
    service_type = 'hostel'
    and private.provider_registration_is_active((select auth.uid()), 'hostel')
    and exists (
      select 1
      from public.hostels h
      where h.id = requests.service_id
        and h.owner_profile_id = (select auth.uid())
    )
  );

drop policy if exists "hostel owners can update requests for their listing"
  on public.requests;
drop policy if exists "active hostel owners can update requests for their listing"
  on public.requests;
create policy "active hostel owners can update requests for their listing"
  on public.requests for update
  to authenticated
  using (
    service_type = 'hostel'
    and private.provider_registration_is_active((select auth.uid()), 'hostel')
    and exists (
      select 1
      from public.hostels h
      where h.id = requests.service_id
        and h.owner_profile_id = (select auth.uid())
    )
  )
  with check (
    service_type = 'hostel'
    and private.provider_registration_is_active((select auth.uid()), 'hostel')
    and exists (
      select 1
      from public.hostels h
      where h.id = requests.service_id
        and h.owner_profile_id = (select auth.uid())
    )
  );

drop policy if exists "restaurant owners can read requests for their listing"
  on public.requests;
drop policy if exists "active restaurant owners can read requests for their listing"
  on public.requests;
create policy "active restaurant owners can read requests for their listing"
  on public.requests for select
  to authenticated
  using (
    service_type = 'food'
    and private.provider_registration_is_active(
      (select auth.uid()),
      'restaurant'
    )
    and exists (
      select 1
      from public.meals m
      join public.restaurants r on r.id = m.restaurant_id
      where m.id = requests.service_id
        and r.owner_profile_id = (select auth.uid())
    )
  );

drop policy if exists "restaurant owners can update requests for their listing"
  on public.requests;
drop policy if exists "active restaurant owners can update requests for their listing"
  on public.requests;
create policy "active restaurant owners can update requests for their listing"
  on public.requests for update
  to authenticated
  using (
    service_type = 'food'
    and private.provider_registration_is_active(
      (select auth.uid()),
      'restaurant'
    )
    and exists (
      select 1
      from public.meals m
      join public.restaurants r on r.id = m.restaurant_id
      where m.id = requests.service_id
        and r.owner_profile_id = (select auth.uid())
    )
  )
  with check (
    service_type = 'food'
    and private.provider_registration_is_active(
      (select auth.uid()),
      'restaurant'
    )
    and exists (
      select 1
      from public.meals m
      join public.restaurants r on r.id = m.restaurant_id
      where m.id = requests.service_id
        and r.owner_profile_id = (select auth.uid())
    )
  );

drop policy if exists "drivers can read requests for their route"
  on public.requests;
drop policy if exists "active drivers can read requests for their route"
  on public.requests;
create policy "active drivers can read requests for their route"
  on public.requests for select
  to authenticated
  using (
    service_type = 'transportation'
    and private.provider_registration_is_active(
      (select auth.uid()),
      'transportation'
    )
    and exists (
      select 1
      from public.transportation_routes tr
      where tr.id = requests.service_id
        and tr.driver_id = (select auth.uid())
    )
  );

drop policy if exists "drivers can update requests for their route"
  on public.requests;
drop policy if exists "active drivers can update requests for their route"
  on public.requests;
create policy "active drivers can update requests for their route"
  on public.requests for update
  to authenticated
  using (
    service_type = 'transportation'
    and private.provider_registration_is_active(
      (select auth.uid()),
      'transportation'
    )
    and exists (
      select 1
      from public.transportation_routes tr
      where tr.id = requests.service_id
        and tr.driver_id = (select auth.uid())
    )
  )
  with check (
    service_type = 'transportation'
    and private.provider_registration_is_active(
      (select auth.uid()),
      'transportation'
    )
    and exists (
      select 1
      from public.transportation_routes tr
      where tr.id = requests.service_id
        and tr.driver_id = (select auth.uid())
    )
  );

drop policy if exists "requests are owner-insertable" on public.requests;
create policy "requests are owner-insertable"
  on public.requests for insert
  to authenticated
  with check (
    (select auth.uid()) = profile_id
    and (
      (
        service_type = 'tutor'
        and exists (
          select 1
          from public.tutors t
          where t.id = requests.service_id
            and (
              t.owner_profile_id is null
              or private.provider_registration_is_active(
                t.owner_profile_id,
                'tutor'
              )
            )
        )
      )
      or (
        service_type = 'hostel'
        and exists (
          select 1
          from public.hostels h
          where h.id = requests.service_id
            and (
              h.owner_profile_id is null
              or private.provider_registration_is_active(
                h.owner_profile_id,
                'hostel'
              )
            )
        )
      )
      or (
        service_type = 'food'
        and exists (
          select 1
          from public.meals m
          join public.restaurants r on r.id = m.restaurant_id
          where m.id = requests.service_id
            and (
              r.owner_profile_id is null
              or private.provider_registration_is_active(
                r.owner_profile_id,
                'restaurant'
              )
            )
        )
      )
      or (
        service_type = 'transportation'
        and exists (
          select 1
          from public.transportation_routes tr
          where tr.id = requests.service_id
            and (
              tr.driver_id is null
              or private.provider_registration_is_active(
                tr.driver_id,
                'transportation'
              )
            )
        )
      )
    )
    and not (
      service_type = 'tutor'
      and exists (
        select 1
        from public.tutors own_tutor
        where own_tutor.owner_profile_id = (select auth.uid())
      )
    )
    and not (
      service_type = 'hostel'
      and exists (
        select 1
        from public.hostels own_hostel
        where own_hostel.owner_profile_id = (select auth.uid())
      )
    )
    and not (
      service_type = 'transportation'
      and exists (
        select 1
        from public.transportation_routes own_route
        where own_route.driver_id = (select auth.uid())
      )
    )
  );

create or replace function public.can_read_tutor_requester_profile(
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.provider_registration_is_active((select auth.uid()), 'tutor')
    and exists (
      select 1
      from public.requests req
      join public.tutors t
        on t.id = req.service_id
       and req.service_type = 'tutor'
      where req.profile_id = p_profile_id
        and t.owner_profile_id = (select auth.uid())
    )
$$;

create or replace function public.can_read_hostel_requester_profile(
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.provider_registration_is_active((select auth.uid()), 'hostel')
    and exists (
      select 1
      from public.requests req
      join public.hostels h
        on h.id = req.service_id
       and req.service_type = 'hostel'
      where req.profile_id = p_profile_id
        and h.owner_profile_id = (select auth.uid())
    )
$$;

create or replace function public.can_read_restaurant_requester_profile(
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.provider_registration_is_active((select auth.uid()), 'restaurant')
    and exists (
      select 1
      from public.requests req
      join public.meals m
        on m.id = req.service_id
       and req.service_type = 'food'
      join public.restaurants r on r.id = m.restaurant_id
      where req.profile_id = p_profile_id
        and r.owner_profile_id = (select auth.uid())
    )
$$;

create or replace function public.can_read_transportation_requester_profile(
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.provider_registration_is_active(
      (select auth.uid()),
      'transportation'
    )
    and exists (
      select 1
      from public.requests req
      join public.transportation_routes tr
        on tr.id = req.service_id
       and req.service_type = 'transportation'
      where req.profile_id = p_profile_id
        and tr.driver_id = (select auth.uid())
    )
$$;

revoke all on function public.can_read_tutor_requester_profile(uuid) from public;
revoke all on function public.can_read_hostel_requester_profile(uuid) from public;
revoke all on function public.can_read_restaurant_requester_profile(uuid) from public;
revoke all on function public.can_read_transportation_requester_profile(uuid)
  from public;
grant execute on function public.can_read_tutor_requester_profile(uuid)
  to authenticated;
grant execute on function public.can_read_hostel_requester_profile(uuid)
  to authenticated;
grant execute on function public.can_read_restaurant_requester_profile(uuid)
  to authenticated;
grant execute on function public.can_read_transportation_requester_profile(uuid)
  to authenticated;

create or replace function public.confirm_transportation_request(
  p_request_id uuid
)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_request public.requests;
  target_route_id uuid;
  seats_left integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated.';
  end if;

  if not private.provider_registration_is_active(
    (select auth.uid()),
    'transportation'
  ) then
    raise exception 'Transportation provider registration is not active.';
  end if;

  select req.service_id
  into target_route_id
  from public.requests req
  where req.id = p_request_id
    and req.service_type = 'transportation'
    and req.status = 'pending';

  if target_route_id is null then
    raise exception 'Request not found or already handled.';
  end if;

  select tr.available_seats
  into seats_left
  from public.transportation_routes tr
  where tr.id = target_route_id
    and tr.driver_id = (select auth.uid())
  for update;

  if seats_left is null then
    raise exception 'You do not manage this route.';
  end if;

  if seats_left <= 0 then
    raise exception 'No seats are available on this route.';
  end if;

  update public.transportation_routes
  set available_seats = available_seats - 1
  where id = target_route_id;

  update public.requests
  set status = 'confirmed', updated_at = now(), seen_by_student = false
  where id = p_request_id
  returning * into updated_request;

  return updated_request;
end;
$$;

create or replace function public.mark_request_completed_by_owner(
  p_request_id uuid
)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_request public.requests;
begin
  if (select auth.uid()) is null then
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
      (
        private.provider_registration_is_active(
          (select auth.uid()),
          'tutor'
        )
        and exists (
          select 1
          from public.tutors t
          where requests.service_type = 'tutor'
            and t.id = requests.service_id
            and t.owner_profile_id = (select auth.uid())
        )
      )
      or (
        private.provider_registration_is_active(
          (select auth.uid()),
          'hostel'
        )
        and exists (
          select 1
          from public.hostels h
          where requests.service_type = 'hostel'
            and h.id = requests.service_id
            and h.owner_profile_id = (select auth.uid())
        )
      )
      or (
        private.provider_registration_is_active(
          (select auth.uid()),
          'restaurant'
        )
        and exists (
          select 1
          from public.meals m
          join public.restaurants r on r.id = m.restaurant_id
          where requests.service_type = 'food'
            and m.id = requests.service_id
            and r.owner_profile_id = (select auth.uid())
        )
      )
      or (
        private.provider_registration_is_active(
          (select auth.uid()),
          'transportation'
        )
        and exists (
          select 1
          from public.transportation_routes tr
          where requests.service_type = 'transportation'
            and tr.id = requests.service_id
            and tr.driver_id = (select auth.uid())
        )
      )
    )
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be completed by this owner.';
  end if;

  return updated_request;
end;
$$;

revoke all on function public.confirm_transportation_request(uuid) from public;
revoke all on function public.mark_request_completed_by_owner(uuid) from public;
grant execute on function public.confirm_transportation_request(uuid)
  to authenticated;
grant execute on function public.mark_request_completed_by_owner(uuid)
  to authenticated;

create or replace function public.submit_provider_registration_payment(
  p_registration_id uuid,
  p_payment_method text,
  p_transaction_reference text
)
returns public.provider_payment_submissions
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration public.provider_registrations;
  submitted_payment public.provider_payment_submissions;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated.';
  end if;

  if p_payment_method not in ('kbzpay', 'wavepay', 'bank_transfer', 'other') then
    raise exception 'Unsupported payment method.';
  end if;

  if nullif(btrim(p_transaction_reference), '') is null then
    raise exception 'Transaction reference is required.';
  end if;

  select pr.*
  into registration
  from public.provider_registrations pr
  where pr.id = p_registration_id
    and pr.profile_id = (select auth.uid())
    and pr.status = 'pending_payment'
  for update;

  if registration.id is null then
    raise exception 'This registration cannot accept a payment submission.';
  end if;

  insert into public.provider_payment_submissions (
    registration_id,
    amount_mmk,
    payment_method,
    transaction_reference
  )
  values (
    registration.id,
    registration.fee_amount_mmk,
    p_payment_method,
    btrim(p_transaction_reference)
  )
  returning * into submitted_payment;

  update public.provider_registrations
  set status = 'payment_review', updated_at = now()
  where id = registration.id;

  return submitted_payment;
end;
$$;

create or replace function public.review_provider_registration_payment(
  p_payment_id uuid,
  p_approve boolean,
  p_rejection_reason text default null
)
returns public.provider_payment_submissions
language plpgsql
security definer
set search_path = ''
as $$
declare
  payment public.provider_payment_submissions;
  registration public.provider_registrations;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  ) then
    raise exception 'Administrator access is required.';
  end if;

  select pps.*
  into payment
  from public.provider_payment_submissions pps
  where pps.id = p_payment_id
    and pps.status = 'submitted'
  for update;

  if payment.id is null then
    raise exception 'This payment submission has already been reviewed.';
  end if;

  select pr.*
  into registration
  from public.provider_registrations pr
  where pr.id = payment.registration_id
  for update;

  if p_approve then
    update public.provider_payment_submissions
    set
      status = 'paid',
      rejection_reason = null,
      reviewed_at = now(),
      reviewed_by = (select auth.uid())
    where id = payment.id
    returning * into payment;

    update public.provider_registrations
    set status = 'active', activated_at = now(), updated_at = now()
    where id = registration.id;

    if registration.provider_type = 'tutor' then
      update public.tutors
      set verified = true
      where owner_profile_id = registration.profile_id;
    elsif registration.provider_type = 'hostel' then
      update public.hostels
      set verified = true
      where owner_profile_id = registration.profile_id;
    elsif registration.provider_type = 'restaurant' then
      update public.restaurants
      set verified = true
      where owner_profile_id = registration.profile_id;
    elsif registration.provider_type = 'transportation' then
      update public.driver_profiles
      set status = 'active', updated_at = now()
      where id = registration.profile_id;

      update public.transportation_routes
      set verified = true
      where driver_id = registration.profile_id;
    end if;
  else
    update public.provider_payment_submissions
    set
      status = 'rejected',
      rejection_reason = nullif(btrim(p_rejection_reason), ''),
      reviewed_at = now(),
      reviewed_by = (select auth.uid())
    where id = payment.id
    returning * into payment;

    update public.provider_registrations
    set status = 'pending_payment', updated_at = now()
    where id = registration.id;
  end if;

  return payment;
end;
$$;

revoke all on function public.submit_provider_registration_payment(
  uuid,
  text,
  text
) from public;
revoke all on function public.submit_provider_registration_payment(
  uuid,
  text,
  text
) from anon;
grant execute on function public.submit_provider_registration_payment(
  uuid,
  text,
  text
) to authenticated;

revoke all on function public.review_provider_registration_payment(
  uuid,
  boolean,
  text
) from public;
revoke all on function public.review_provider_registration_payment(
  uuid,
  boolean,
  text
) from anon;
grant execute on function public.review_provider_registration_payment(
  uuid,
  boolean,
  text
) to authenticated;

revoke all on function private.create_provider_registration_from_listing()
  from public;
revoke all on function private.enforce_provider_publication_state()
  from public;
revoke all on function private.enforce_driver_registration_status()
  from public;
revoke all on function private.prevent_client_profile_role_change()
  from public;
