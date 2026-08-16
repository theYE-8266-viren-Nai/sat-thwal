alter table public.requests
  add column if not exists student_disputed_at timestamptz,
  add column if not exists student_dispute_reason text,
  add column if not exists resolved_by_admin_id uuid references public.profiles(id),
  add column if not exists admin_resolution_note text,
  add column if not exists auto_resolve_at timestamptz,
  add column if not exists resolution_source text
    check (
      resolution_source is null
      or resolution_source in ('student_confirmed', 'auto_resolved', 'admin_resolved')
    );

create index if not exists requests_resolution_queue_idx
  on public.requests (status, auto_resolve_at)
  where status = 'confirmed' and completed_at is null;

create index if not exists requests_dispute_queue_idx
  on public.requests (student_disputed_at desc)
  where student_disputed_at is not null and completed_at is null;

create or replace function public.is_request_service_owner(p_request public.requests)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    case p_request.service_type
      when 'tutor' then exists (
        select 1 from public.tutors
        where id = p_request.service_id and owner_profile_id = auth.uid()
      )
      when 'hostel' then exists (
        select 1 from public.hostels
        where id = p_request.service_id and owner_profile_id = auth.uid()
      )
      when 'food' then exists (
        select 1
        from public.food_packages fp
        join public.restaurants r on r.id = fp.restaurant_id
        where fp.id = p_request.service_id and r.owner_profile_id = auth.uid()
      )
      when 'transportation' then exists (
        select 1 from public.transportation_routes
        where id = p_request.service_id and driver_id = auth.uid()
      )
      else false
    end;
$$;

create or replace function public.is_current_profile_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.mark_request_provided(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_request public.requests;
begin
  update public.requests
  set
    owner_completed_at = coalesce(owner_completed_at, now()),
    auto_resolve_at = coalesce(auto_resolve_at, now() + interval '3 days'),
    seen_by_student = false,
    updated_at = now()
  where id = p_request_id
    and status = 'confirmed'
    and completed_at is null
    and student_disputed_at is null
    and public.is_request_service_owner(requests)
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be marked as provided by this provider.';
  end if;

  return updated_request;
end;
$$;

create or replace function public.confirm_request_received(p_request_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_request public.requests;
begin
  update public.requests
  set
    requester_completed_at = coalesce(requester_completed_at, now()),
    completed_at = coalesce(completed_at, now()),
    status = 'completed',
    resolution_source = 'student_confirmed',
    updated_at = now()
  where id = p_request_id
    and profile_id = auth.uid()
    and status = 'confirmed'
    and owner_completed_at is not null
    and completed_at is null
    and student_disputed_at is null
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be confirmed as received.';
  end if;

  return updated_request;
end;
$$;

create or replace function public.dispute_request(p_request_id uuid, p_reason text)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_request public.requests;
begin
  update public.requests
  set
    student_disputed_at = coalesce(student_disputed_at, now()),
    student_dispute_reason = coalesce(nullif(trim(p_reason), ''), 'Student reported a problem.'),
    updated_at = now()
  where id = p_request_id
    and profile_id = auth.uid()
    and status = 'confirmed'
    and owner_completed_at is not null
    and completed_at is null
  returning * into updated_request;

  if updated_request.id is null then
    raise exception 'Request cannot be reported for review.';
  end if;

  return updated_request;
end;
$$;

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

create or replace function public.resolve_due_requests()
returns setof public.requests
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_current_profile_admin() then
    raise exception 'Only admins can resolve due requests.';
  end if;

  return query
    update public.requests
    set
      status = 'completed',
      completed_at = coalesce(completed_at, auto_resolve_at, now()),
      resolution_source = 'auto_resolved',
      updated_at = now()
    where status = 'confirmed'
      and owner_completed_at is not null
      and student_disputed_at is null
      and completed_at is null
      and auto_resolve_at <= now()
    returning *;
end;
$$;

create or replace function private.audit_request_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  request_metadata jsonb;
begin
  if tg_op = 'INSERT' then
    request_metadata := jsonb_build_object(
      'service_type', new.service_type,
      'service_id', new.service_id,
      'status', new.status,
      'note', new.note
    );

    perform private.insert_admin_audit_event(
      'request',
      new.id,
      'request_created',
      'Student request created for ' || new.service_type || ' service.',
      request_metadata
    );

    return new;
  end if;

  request_metadata := jsonb_build_object(
    'service_type', new.service_type,
    'service_id', new.service_id,
    'old_status', old.status,
    'new_status', new.status,
    'rejection_reason', new.rejection_reason,
    'student_disputed_at', new.student_disputed_at,
    'resolution_source', new.resolution_source,
    'admin_resolution_note', new.admin_resolution_note
  );

  if old.status is distinct from new.status then
    if new.status = 'confirmed' then
      perform private.insert_admin_audit_event(
        'request',
        new.id,
        'request_confirmed',
        'Student request accepted for ' || new.service_type || ' service.',
        request_metadata
      );
    elsif new.status = 'cancelled' then
      perform private.insert_admin_audit_event(
        'request',
        new.id,
        'request_cancelled',
        'Student request cancelled for ' || new.service_type || ' service.',
        request_metadata
      );
    elsif new.status = 'completed' and new.completed_at is null then
      perform private.insert_admin_audit_event(
        'request',
        new.id,
        'request_completed',
        'Student request resolved for ' || new.service_type || ' service.',
        request_metadata
      );
    end if;
  end if;

  if old.student_disputed_at is null and new.student_disputed_at is not null then
    perform private.insert_admin_audit_event(
      'request',
      new.id,
      'request_confirmed',
      'Student reported a problem for ' || new.service_type || ' service.',
      request_metadata || jsonb_build_object('student_dispute_reason', new.student_dispute_reason)
    );
  end if;

  if old.requester_completed_at is null and new.requester_completed_at is not null then
    perform private.insert_admin_audit_event(
      'request',
      new.id,
      'request_student_completed',
      'Student confirmed support received for ' || new.service_type || ' service.',
      request_metadata || jsonb_build_object('requester_completed_at', new.requester_completed_at)
    );
  end if;

  if old.owner_completed_at is null and new.owner_completed_at is not null then
    perform private.insert_admin_audit_event(
      'request',
      new.id,
      'request_owner_completed',
      'Provider marked support as provided for ' || new.service_type || ' service.',
      request_metadata || jsonb_build_object(
        'owner_completed_at', new.owner_completed_at,
        'auto_resolve_at', new.auto_resolve_at
      )
    );
  end if;

  if old.completed_at is null and new.completed_at is not null then
    perform private.insert_admin_audit_event(
      'request',
      new.id,
      'request_completed',
      'Student request resolved for ' || new.service_type || ' service.',
      request_metadata || jsonb_build_object('completed_at', new.completed_at)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists audit_request_update on public.requests;
create trigger audit_request_update
  after update of status, requester_completed_at, owner_completed_at, completed_at, rejection_reason, student_disputed_at, admin_resolution_note, resolution_source
  on public.requests
  for each row execute function private.audit_request_change();

revoke all on function public.is_request_service_owner(public.requests) from public;
revoke all on function public.is_current_profile_admin() from public;
revoke all on function public.mark_request_provided(uuid) from public;
revoke all on function public.confirm_request_received(uuid) from public;
revoke all on function public.dispute_request(uuid, text) from public;
revoke all on function public.admin_resolve_request(uuid, text) from public;
revoke all on function public.admin_cancel_request(uuid, text) from public;
revoke all on function public.resolve_due_requests() from public;

grant execute on function public.mark_request_provided(uuid) to authenticated;
grant execute on function public.confirm_request_received(uuid) to authenticated;
grant execute on function public.dispute_request(uuid, text) to authenticated;
grant execute on function public.admin_resolve_request(uuid, text) to authenticated;
grant execute on function public.admin_cancel_request(uuid, text) to authenticated;
grant execute on function public.resolve_due_requests() to authenticated;
