-- Adds two-sided completion for tutor and hostel requests.

alter table requests
  add column if not exists requester_completed_at timestamptz,
  add column if not exists owner_completed_at timestamptz,
  add column if not exists completed_at timestamptz;

drop policy if exists "requests are owner-updatable" on requests;

create or replace function public.mark_request_responses_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  update public.requests
  set seen_by_student = true
  where profile_id = auth.uid()
    and seen_by_student = false;
end;
$$;

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
    and service_type in ('tutor', 'hostel')
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
    and service_type in ('tutor', 'hostel')
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
revoke all on function public.mark_request_responses_seen() from public;
grant execute on function public.mark_request_completed_by_requester(uuid) to authenticated;
grant execute on function public.mark_request_completed_by_owner(uuid) to authenticated;
grant execute on function public.mark_request_responses_seen() to authenticated;
