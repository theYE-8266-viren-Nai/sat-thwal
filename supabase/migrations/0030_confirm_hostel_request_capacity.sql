-- Prevent hostel owners from accepting more confirmed bookings than listed rooms.

create or replace function public.confirm_hostel_request(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_request public.requests;
  target_hostel_id uuid;
  room_capacity integer;
  active_count integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  select service_id into target_hostel_id
  from public.requests
  where id = p_request_id
    and service_type = 'hostel'
    and status = 'pending';

  if target_hostel_id is null then
    raise exception 'Request not found or already handled.';
  end if;

  select available_rooms into room_capacity
  from public.hostels
  where id = target_hostel_id
    and owner_profile_id = auth.uid()
  for update;

  if room_capacity is null then
    raise exception 'You do not manage this hostel listing.';
  end if;

  if room_capacity <= 0 then
    raise exception 'No rooms are available for this hostel.';
  end if;

  select count(*) into active_count
  from public.requests
  where service_type = 'hostel'
    and service_id = target_hostel_id
    and status = 'confirmed';

  if active_count >= room_capacity then
    raise exception 'This hostel is already fully booked.';
  end if;

  update public.requests
  set status = 'confirmed', updated_at = now(), seen_by_student = false
  where id = p_request_id
  returning * into updated_request;

  return updated_request;
end;
$$;

revoke all on function public.confirm_hostel_request(uuid) from public;
grant execute on function public.confirm_hostel_request(uuid) to authenticated;
