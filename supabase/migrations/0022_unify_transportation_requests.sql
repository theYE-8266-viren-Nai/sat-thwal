-- Unifies transportation seat bookings onto the generic `requests` table,
-- matching the pattern already used by tutor/hostel/food (owner reads +
-- responds to rows in `requests` via an RLS join to the listing they own).
--
-- This also fixes a real bug: since every transportation_routes.driver_id
-- has been null (no route was ever assignable to a driver), every seat
-- booking attempt already fell through to the generic createRequest() path
-- in ConfirmationModal.tsx's try/catch, silently dropping pickup stop/time
-- and inserting straight into `requests`. This migration formalizes that as
-- the one real path instead of an accidental fallback.

-- 1. Add transportation-specific fields to the shared requests table.
alter table requests
  add column if not exists pickup_stop_id text,
  add column if not exists pickup_stop_name text,
  add column if not exists pickup_time text,
  add column if not exists pickup_address text,
  add column if not exists rejection_reason text;

-- 2. Carry over any existing transportation_registrations rows before the
--    table is dropped below (expected to be near-empty, but not assumed).
insert into requests (
  profile_id, service_type, service_id, status, note,
  pickup_stop_id, pickup_stop_name, pickup_time, pickup_address, rejection_reason,
  created_at, updated_at
)
select
  student_id,
  'transportation',
  route_id,
  case status
    when 'approved' then 'confirmed'
    when 'rejected' then 'cancelled'
    else status
  end,
  null,
  pickup_stop_id,
  pickup_stop_name,
  pickup_time,
  pickup_address,
  rejection_reason,
  created_at,
  updated_at
from transportation_registrations tr
where not exists (
  select 1 from requests r
  where r.profile_id = tr.student_id
    and r.service_type = 'transportation'
    and r.service_id = tr.route_id
    and r.created_at = tr.created_at
);

-- 3. Extend duplicate-active-request protection (previously tutor/hostel
--    only) to cover transportation, matching the old unique index that
--    lived on transportation_registrations (student_id, route_id).
with ranked_duplicate_requests as (
  select
    id,
    row_number() over (
      partition by profile_id, service_type, service_id
      order by updated_at desc, created_at desc, id desc
    ) as duplicate_rank
  from requests
  where service_type = 'transportation'
    and status in ('pending', 'confirmed', 'completed')
)
update requests
set status = 'cancelled', updated_at = now()
from ranked_duplicate_requests
where requests.id = ranked_duplicate_requests.id
  and ranked_duplicate_requests.duplicate_rank > 1;

drop index if exists requests_active_tutor_hostel_unique;

create unique index if not exists requests_active_provider_unique
  on requests (profile_id, service_type, service_id)
  where service_type in ('tutor', 'hostel', 'transportation')
    and status in ('pending', 'confirmed', 'completed');

-- 4. Drivers can't book seats on routes they operate (mirrors the existing
--    tutor/hostel peer-block from 0016).
drop policy if exists "requests are owner-insertable" on requests;

create policy "requests are owner-insertable" on requests
  for insert with check (
    auth.uid() = profile_id
    and not (
      service_type = 'tutor'
      and exists (select 1 from tutors where tutors.owner_profile_id = auth.uid())
    )
    and not (
      service_type = 'hostel'
      and exists (select 1 from hostels where hostels.owner_profile_id = auth.uid())
    )
    and not (
      service_type = 'transportation'
      and exists (select 1 from transportation_routes where transportation_routes.driver_id = auth.uid())
    )
  );

-- 5. Drivers can read and update requests against routes they operate.
create policy "drivers can read requests for their route" on requests
  for select using (
    service_type = 'transportation' and exists (
      select 1 from transportation_routes
      where transportation_routes.id = requests.service_id
        and transportation_routes.driver_id = auth.uid()
    )
  );

create policy "drivers can update requests for their route" on requests
  for update using (
    service_type = 'transportation' and exists (
      select 1 from transportation_routes
      where transportation_routes.id = requests.service_id
        and transportation_routes.driver_id = auth.uid()
    )
  )
  with check (
    service_type = 'transportation' and exists (
      select 1 from transportation_routes
      where transportation_routes.id = requests.service_id
        and transportation_routes.driver_id = auth.uid()
    )
  );

-- 6. Drivers can read the profiles of students who requested their routes
--    (replaces the transportation_registrations-based check this drops).
create or replace function public.can_read_transportation_requester_profile(p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.requests
    join public.transportation_routes
      on transportation_routes.id = requests.service_id
     and requests.service_type = 'transportation'
    where requests.profile_id = p_profile_id
      and transportation_routes.driver_id = auth.uid()
  );
$$;

drop policy if exists "drivers can read requester profiles" on public.profiles;
drop policy if exists "drivers can read profiles of their requesters" on public.profiles;

create policy "drivers can read profiles of their requesters"
  on public.profiles for select
  using (public.can_read_transportation_requester_profile(id));

revoke all on function public.can_read_transportation_requester_profile(uuid) from public;
grant execute on function public.can_read_transportation_requester_profile(uuid) to authenticated;

-- 7. Atomic seat confirmation: checks the caller owns the route and a seat
--    is still available, confirms the request, and decrements available
--    seats in one transaction (the old code did this as two separate
--    unguarded updates, which could over-book under concurrent approvals).
create or replace function public.confirm_transportation_request(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_request public.requests;
  target_route_id uuid;
  seats_left integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  select service_id into target_route_id
  from public.requests
  where id = p_request_id
    and service_type = 'transportation'
    and status = 'pending';

  if target_route_id is null then
    raise exception 'Request not found or already handled.';
  end if;

  select available_seats into seats_left
  from public.transportation_routes
  where id = target_route_id
    and driver_id = auth.uid()
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

revoke all on function public.confirm_transportation_request(uuid) from public;
grant execute on function public.confirm_transportation_request(uuid) to authenticated;

-- 8. Re-point notification.registration_id at requests instead of the
--    dropped transportation_registrations table, then drop the old table
--    and its now-unused driver-only profile-read helper.
alter table notifications drop constraint if exists notifications_registration_id_fkey;

drop table if exists transportation_registrations cascade;

alter table notifications
  add constraint notifications_registration_id_fkey
  foreign key (registration_id) references requests (id) on delete cascade;

drop function if exists private.driver_can_read_student_profile(uuid);

-- Also unused since 0015 superseded it with the private-schema version above
-- (never dropped at the time), and it references the table just dropped.
drop function if exists public.can_read_driver_requester_profile(uuid);
