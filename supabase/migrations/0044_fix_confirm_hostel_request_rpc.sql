-- Align hostel acceptance with the shared request-owner logic and avoid
-- ambiguous identifiers inside the security-definer RPC.

create or replace function public.confirm_hostel_request(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_request public.requests;
  updated_request public.requests;
  room_capacity integer;
  active_count integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Not authenticated.';
  end if;

  select req.*
  into target_request
  from public.requests req
  where req.id = p_request_id
    and req.service_type = 'hostel'
    and req.status = 'pending';

  if target_request.id is null then
    raise exception 'Request not found or already handled.';
  end if;

  if not public.is_request_service_owner(target_request) then
    raise exception 'You do not manage this hostel listing.';
  end if;

  select h.available_rooms
  into room_capacity
  from public.hostels h
  where h.id = target_request.service_id
  for update of h;

  if room_capacity is null then
    raise exception 'Hostel listing was not found.';
  end if;

  if room_capacity <= 0 then
    raise exception 'No rooms are available for this hostel.';
  end if;

  select count(*)::integer
  into active_count
  from public.requests req
  where req.service_type = 'hostel'
    and req.service_id = target_request.service_id
    and req.status = 'confirmed';

  if active_count >= room_capacity then
    raise exception 'This hostel is already fully booked.';
  end if;

  update public.requests req
  set
    status = 'confirmed',
    updated_at = now(),
    seen_by_student = false
  where req.id = p_request_id
    and req.status = 'pending'
    and public.is_request_service_owner(req)
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request could not be accepted.';
  end if;

  return updated_request;
end;
$$;

revoke all on function public.confirm_hostel_request(uuid) from public;
revoke all on function public.confirm_hostel_request(uuid) from anon;
grant execute on function public.confirm_hostel_request(uuid) to authenticated;
