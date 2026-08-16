-- Expose limited contact details only after tutor/hostel requests are accepted.

create or replace function public.get_accepted_request_contact(p_request_id uuid)
returns table (
  request_id uuid,
  service_type text,
  request_status text,
  request_note text,
  requested_at timestamptz,
  contact_profile_id uuid,
  contact_role text,
  full_name text,
  avatar_url text,
  phone text,
  township text,
  academic_year text,
  preferred_subjects text[],
  language_preference text
)
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  target_request public.requests;
  owner_id uuid;
  visible_profile_id uuid;
  visible_role text;
begin
  if (select auth.uid()) is null then
    return;
  end if;

  select *
  into target_request
  from public.requests
  where id = p_request_id
    and service_type in ('tutor', 'hostel')
    and status in ('confirmed', 'completed');

  if target_request.id is null then
    return;
  end if;

  if target_request.service_type = 'tutor' then
    select owner_profile_id
    into owner_id
    from public.tutors
    where id = target_request.service_id;

    visible_role := 'tutor';
  elsif target_request.service_type = 'hostel' then
    select owner_profile_id
    into owner_id
    from public.hostels
    where id = target_request.service_id;

    visible_role := 'hostel_owner';
  end if;

  if owner_id is null then
    return;
  end if;

  if target_request.profile_id = (select auth.uid()) then
    visible_profile_id := owner_id;
  elsif owner_id = (select auth.uid()) then
    visible_profile_id := target_request.profile_id;
    visible_role := 'student';
  else
    return;
  end if;

  return query
    select
      target_request.id,
      target_request.service_type,
      target_request.status,
      target_request.note,
      target_request.created_at,
      profiles.id,
      visible_role,
      profiles.full_name,
      profiles.avatar_url,
      profiles.phone,
      profiles.township,
      profiles.academic_year,
      profiles.preferred_subjects,
      profiles.language_preference
    from public.profiles
    where profiles.id = visible_profile_id;
end;
$$;

revoke all on function public.get_accepted_request_contact(uuid) from public;
revoke all on function public.get_accepted_request_contact(uuid) from anon;
grant execute on function public.get_accepted_request_contact(uuid) to authenticated;
