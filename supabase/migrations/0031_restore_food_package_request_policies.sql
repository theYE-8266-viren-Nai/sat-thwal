-- Restore restaurant request access to food_packages after provider registration policies
-- rewrote food request checks back to legacy meals.

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
              or private.provider_registration_is_active(t.owner_profile_id, 'tutor')
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
              or private.provider_registration_is_active(h.owner_profile_id, 'hostel')
            )
        )
      )
      or (
        service_type = 'food'
        and exists (
          select 1
          from public.food_packages fp
          join public.restaurants r on r.id = fp.restaurant_id
          where fp.id = requests.service_id
            and fp.is_enabled
            and (
              r.owner_profile_id is null
              or private.provider_registration_is_active(r.owner_profile_id, 'restaurant')
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
              or private.provider_registration_is_active(tr.driver_id, 'transportation')
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
      service_type = 'food'
      and exists (
        select 1
        from public.restaurants own_restaurant
        where own_restaurant.owner_profile_id = (select auth.uid())
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

drop policy if exists "restaurant owners can read requests for their listing" on public.requests;
drop policy if exists "active restaurant owners can read requests for their listing" on public.requests;
create policy "active restaurant owners can read requests for their listing"
  on public.requests for select
  to authenticated
  using (
    service_type = 'food'
    and private.provider_registration_is_active((select auth.uid()), 'restaurant')
    and exists (
      select 1
      from public.food_packages fp
      join public.restaurants r on r.id = fp.restaurant_id
      where fp.id = requests.service_id
        and r.owner_profile_id = (select auth.uid())
    )
  );

drop policy if exists "restaurant owners can update requests for their listing" on public.requests;
drop policy if exists "active restaurant owners can update requests for their listing" on public.requests;
create policy "active restaurant owners can update requests for their listing"
  on public.requests for update
  to authenticated
  using (
    service_type = 'food'
    and private.provider_registration_is_active((select auth.uid()), 'restaurant')
    and exists (
      select 1
      from public.food_packages fp
      join public.restaurants r on r.id = fp.restaurant_id
      where fp.id = requests.service_id
        and r.owner_profile_id = (select auth.uid())
    )
  )
  with check (
    service_type = 'food'
    and private.provider_registration_is_active((select auth.uid()), 'restaurant')
    and exists (
      select 1
      from public.food_packages fp
      join public.restaurants r on r.id = fp.restaurant_id
      where fp.id = requests.service_id
        and r.owner_profile_id = (select auth.uid())
    )
  );

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
      join public.food_packages fp
        on fp.id = req.service_id
       and req.service_type = 'food'
      join public.restaurants r on r.id = fp.restaurant_id
      where req.profile_id = p_profile_id
        and r.owner_profile_id = (select auth.uid())
    )
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
        from public.tutors t
        where requests.service_type = 'tutor'
          and t.id = requests.service_id
          and t.owner_profile_id = auth.uid()
      )
      or exists (
        select 1
        from public.hostels h
        where requests.service_type = 'hostel'
          and h.id = requests.service_id
          and h.owner_profile_id = auth.uid()
      )
      or exists (
        select 1
        from public.food_packages fp
        join public.restaurants r on r.id = fp.restaurant_id
        where requests.service_type = 'food'
          and fp.id = requests.service_id
          and r.owner_profile_id = auth.uid()
      )
      or exists (
        select 1
        from public.transportation_routes tr
        where requests.service_type = 'transportation'
          and tr.id = requests.service_id
          and tr.driver_id = auth.uid()
      )
    )
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be completed by this owner.';
  end if;

  return updated_request;
end;
$$;

revoke all on function public.can_read_restaurant_requester_profile(uuid) from public;
revoke all on function public.mark_request_completed_by_owner(uuid) from public;
grant execute on function public.can_read_restaurant_requester_profile(uuid) to authenticated;
grant execute on function public.mark_request_completed_by_owner(uuid) to authenticated;
