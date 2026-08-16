-- Hostel owners are still students: allow them to request other hostel listings,
-- while preventing requests against their own hostel room.

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
            and t.verified
            and (
              t.owner_profile_id is null
              or t.owner_profile_id <> (select auth.uid())
            )
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
            and h.verified
            and (
              h.owner_profile_id is null
              or h.owner_profile_id <> (select auth.uid())
            )
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