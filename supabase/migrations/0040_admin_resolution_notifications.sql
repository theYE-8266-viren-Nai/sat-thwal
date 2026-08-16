-- Notify both sides of a request when an admin resolves or cancels a disputed case.

alter table public.requests
  add column if not exists seen_by_owner boolean not null default true;

create or replace function public.admin_resolve_request(p_request_id uuid, p_note text default null)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_request public.requests;
begin
  if not public.is_current_profile_admin() then
    raise exception 'Only admins can resolve requests.';
  end if;

  update public.requests
  set
    completed_at = coalesce(completed_at, now()),
    status = 'completed',
    resolved_by_admin_id = auth.uid(),
    admin_resolution_note = nullif(trim(coalesce(p_note, '')), ''),
    resolution_source = 'admin_resolved',
    seen_by_student = false,
    seen_by_owner = false,
    updated_at = now()
  where id = p_request_id
    and status in ('pending', 'confirmed')
    and completed_at is null
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be resolved.';
  end if;

  return updated_request;
end;
$$;

create or replace function public.admin_cancel_request(p_request_id uuid, p_note text default null)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned_note text := nullif(trim(coalesce(p_note, '')), '');
  updated_request public.requests;
begin
  if not public.is_current_profile_admin() then
    raise exception 'Only admins can cancel requests.';
  end if;

  update public.requests
  set
    status = 'cancelled',
    rejection_reason = cleaned_note,
    resolved_by_admin_id = auth.uid(),
    admin_resolution_note = cleaned_note,
    seen_by_student = false,
    seen_by_owner = false,
    updated_at = now()
  where id = p_request_id
    and status in ('pending', 'confirmed')
    and completed_at is null
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be cancelled.';
  end if;

  return updated_request;
end;
$$;

create or replace function public.get_owner_unseen_resolutions()
returns setof public.requests
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  return query
    select r.*
    from public.requests r
    where r.seen_by_owner = false
      and r.resolved_by_admin_id is not null
      and public.is_request_service_owner(r)
    order by r.updated_at desc;
end;
$$;

create or replace function public.mark_owner_resolutions_seen()
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
  set seen_by_owner = true
  where seen_by_owner = false
    and resolved_by_admin_id is not null
    and public.is_request_service_owner(requests);
end;
$$;

revoke all on function public.get_owner_unseen_resolutions() from public;
revoke all on function public.mark_owner_resolutions_seen() from public;

grant execute on function public.get_owner_unseen_resolutions() to authenticated;
grant execute on function public.mark_owner_resolutions_seen() to authenticated;
