  create table if not exists public.admin_audit_events (
    id uuid primary key default gen_random_uuid(),
    entity_type text not null
      check (entity_type in ('request', 'provider_registration')),
    entity_id uuid not null,
    event_type text not null
      check (
        event_type in (
          'request_created',
          'request_confirmed',
          'request_cancelled',
          'request_owner_completed',
          'request_student_completed',
          'request_completed',
          'provider_payment_submitted',
          'provider_approved',
          'provider_rejected'
        )
      ),
    actor_profile_id uuid references public.profiles (id) on delete set null,
    actor_role text,
    summary text not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
  );
  
  create index if not exists admin_audit_events_created_at_idx
    on public.admin_audit_events (created_at desc);
  
  create index if not exists admin_audit_events_entity_idx
    on public.admin_audit_events (entity_type, entity_id, created_at desc);
  
  create index if not exists admin_audit_events_event_type_idx
    on public.admin_audit_events (event_type, created_at desc);
  
  alter table public.admin_audit_events enable row level security;
  
  drop policy if exists "admins can read audit events" on public.admin_audit_events;
  create policy "admins can read audit events"
    on public.admin_audit_events for select
    using (public.is_admin_user(auth.uid()));
  
  create or replace function private.current_actor_role()
  returns text
  language sql
  stable
  security definer
  set search_path = public
  as $$
    select role
    from public.profiles
    where id = auth.uid()
    limit 1
  $$;
  
  create or replace function private.insert_admin_audit_event(
    p_entity_type text,
    p_entity_id uuid,
    p_event_type text,
    p_summary text,
    p_metadata jsonb default '{}'::jsonb,
    p_actor_profile_id uuid default auth.uid(),
    p_actor_role text default private.current_actor_role(),
    p_created_at timestamptz default now()
  )
  returns void
  language plpgsql
  security definer
  set search_path = public, private
  as $$
  begin
    insert into public.admin_audit_events (
      entity_type,
      entity_id,
      event_type,
      actor_profile_id,
      actor_role,
      summary,
      metadata,
      created_at
    )
    values (
      p_entity_type,
      p_entity_id,
      p_event_type,
      p_actor_profile_id,
      p_actor_role,
      p_summary,
      coalesce(p_metadata, '{}'::jsonb),
      coalesce(p_created_at, now())
    );
  end;
  $$;
  
  create or replace function private.prevent_admin_audit_event_mutation()
  returns trigger
  language plpgsql
  as $$
  begin
    raise exception 'Admin audit events are append-only.';
  end;
  $$;
  
  drop trigger if exists prevent_admin_audit_event_update on public.admin_audit_events;
  create trigger prevent_admin_audit_event_update
    before update on public.admin_audit_events
    for each row execute function private.prevent_admin_audit_event_mutation();
  
  drop trigger if exists prevent_admin_audit_event_delete on public.admin_audit_events;
  create trigger prevent_admin_audit_event_delete
    before delete on public.admin_audit_events
    for each row execute function private.prevent_admin_audit_event_mutation();
  
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
      'rejection_reason', new.rejection_reason
    );
  
    if old.status is distinct from new.status then
      if new.status = 'confirmed' then
        perform private.insert_admin_audit_event(
          'request',
          new.id,
          'request_confirmed',
          'Student request confirmed for ' || new.service_type || ' service.',
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
          'Student request completed for ' || new.service_type || ' service.',
          request_metadata
        );
      end if;
    end if;
  
    if old.requester_completed_at is null and new.requester_completed_at is not null then
      perform private.insert_admin_audit_event(
        'request',
        new.id,
        'request_student_completed',
        'Student marked the ' || new.service_type || ' request complete.',
        request_metadata || jsonb_build_object('requester_completed_at', new.requester_completed_at)
      );
    end if;
  
    if old.owner_completed_at is null and new.owner_completed_at is not null then
      perform private.insert_admin_audit_event(
        'request',
        new.id,
        'request_owner_completed',
        'Service owner marked the ' || new.service_type || ' request complete.',
        request_metadata || jsonb_build_object('owner_completed_at', new.owner_completed_at)
      );
    end if;
  
    if old.completed_at is null and new.completed_at is not null then
      perform private.insert_admin_audit_event(
        'request',
        new.id,
        'request_completed',
        'Student request completed for ' || new.service_type || ' service.',
        request_metadata || jsonb_build_object('completed_at', new.completed_at)
      );
    end if;
  
    return new;
  end;
  $$;
  
  drop trigger if exists audit_request_insert on public.requests;
  create trigger audit_request_insert
    after insert on public.requests
    for each row execute function private.audit_request_change();
  
  drop trigger if exists audit_request_update on public.requests;
  create trigger audit_request_update
    after update of status, requester_completed_at, owner_completed_at, completed_at, rejection_reason
    on public.requests
    for each row execute function private.audit_request_change();
  
  create or replace function private.audit_provider_payment_change()
  returns trigger
  language plpgsql
  security definer
  set search_path = public, private
  as $$
  declare
    registration_row public.provider_registrations;
    provider_metadata jsonb;
  begin
    select *
    into registration_row
    from public.provider_registrations
    where id = new.registration_id;
  
    provider_metadata := jsonb_build_object(
      'payment_id', new.id,
      'provider_type', registration_row.provider_type,
      'provider_profile_id', registration_row.profile_id,
      'amount_mmk', new.amount_mmk,
      'payment_method', new.payment_method,
      'old_status', case when tg_op = 'UPDATE' then old.status else null end,
      'new_status', new.status,
      'rejection_reason', new.rejection_reason
    );
  
    if tg_op = 'INSERT' then
      perform private.insert_admin_audit_event(
        'provider_registration',
        new.registration_id,
        'provider_payment_submitted',
        'Provider submitted school verification for ' || registration_row.provider_type || '.',
        provider_metadata,
        registration_row.profile_id,
        'provider',
        new.submitted_at
      );
  
      return new;
    end if;
  
    if old.status is distinct from new.status then
      if new.status = 'paid' then
        perform private.insert_admin_audit_event(
          'provider_registration',
          new.registration_id,
          'provider_approved',
          'School admin approved ' || registration_row.provider_type || ' provider verification.',
          provider_metadata,
          new.reviewed_by,
          private.current_actor_role(),
          coalesce(new.reviewed_at, now())
        );
      elsif new.status = 'rejected' then
        perform private.insert_admin_audit_event(
          'provider_registration',
          new.registration_id,
          'provider_rejected',
          'School admin rejected ' || registration_row.provider_type || ' provider verification.',
          provider_metadata,
          new.reviewed_by,
          private.current_actor_role(),
          coalesce(new.reviewed_at, now())
        );
      end if;
    end if;
  
    return new;
  end;
  $$;
  
  drop trigger if exists audit_provider_payment_insert on public.provider_payment_submissions;
  create trigger audit_provider_payment_insert
    after insert on public.provider_payment_submissions
    for each row execute function private.audit_provider_payment_change();
  
  drop trigger if exists audit_provider_payment_update on public.provider_payment_submissions;
  create trigger audit_provider_payment_update
    after update of status, rejection_reason, reviewed_at, reviewed_by
    on public.provider_payment_submissions
    for each row execute function private.audit_provider_payment_change();
  
  insert into public.admin_audit_events (
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    actor_role,
    summary,
    metadata,
    created_at
  )
  select
    'request',
    req.id,
    'request_created',
    null,
    null,
    'Student request created for ' || req.service_type || ' service.',
    jsonb_build_object(
      'service_type', req.service_type,
      'service_id', req.service_id,
      'status', req.status,
      'note', req.note,
      'backfilled', true
    ),
    req.created_at
  from public.requests req
  where not exists (
    select 1
    from public.admin_audit_events event
    where event.entity_type = 'request'
      and event.entity_id = req.id
      and event.event_type = 'request_created'
  );
  
  insert into public.admin_audit_events (
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    actor_role,
    summary,
    metadata,
    created_at
  )
  select
    'request',
    req.id,
    case
      when req.status = 'confirmed' then 'request_confirmed'
      when req.status = 'cancelled' then 'request_cancelled'
      else 'request_completed'
    end,
    null,
    null,
    case
      when req.status = 'confirmed' then 'Student request confirmed for ' || req.service_type || ' service.'
      when req.status = 'cancelled' then 'Student request cancelled for ' || req.service_type || ' service.'
      else 'Student request completed for ' || req.service_type || ' service.'
    end,
    jsonb_build_object(
      'service_type', req.service_type,
      'service_id', req.service_id,
      'status', req.status,
      'rejection_reason', req.rejection_reason,
      'backfilled', true
    ),
    coalesce(req.completed_at, req.updated_at)
  from public.requests req
  where req.status in ('confirmed', 'cancelled', 'completed')
    and not exists (
      select 1
      from public.admin_audit_events event
      where event.entity_type = 'request'
        and event.entity_id = req.id
        and event.event_type = case
          when req.status = 'confirmed' then 'request_confirmed'
          when req.status = 'cancelled' then 'request_cancelled'
          else 'request_completed'
        end
    );
  
  insert into public.admin_audit_events (
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    actor_role,
    summary,
    metadata,
    created_at
  )
  select
    'provider_registration',
    pps.registration_id,
    'provider_payment_submitted',
    null,
    null,
    'Provider submitted school verification for ' || pr.provider_type || '.',
    jsonb_build_object(
      'payment_id', pps.id,
      'provider_type', pr.provider_type,
      'provider_profile_id', pr.profile_id,
      'amount_mmk', pps.amount_mmk,
      'payment_method', pps.payment_method,
      'status', pps.status,
      'backfilled', true
    ),
    pps.submitted_at
  from public.provider_payment_submissions pps
  join public.provider_registrations pr on pr.id = pps.registration_id
  where not exists (
    select 1
    from public.admin_audit_events event
    where event.entity_type = 'provider_registration'
      and event.entity_id = pps.registration_id
      and event.event_type = 'provider_payment_submitted'
      and event.metadata ->> 'payment_id' = pps.id::text
  );
  
  insert into public.admin_audit_events (
    entity_type,
    entity_id,
    event_type,
    actor_profile_id,
    actor_role,
    summary,
    metadata,
    created_at
  )
  select
    'provider_registration',
    pps.registration_id,
    case when pps.status = 'paid' then 'provider_approved' else 'provider_rejected' end,
    pps.reviewed_by,
    null,
    case
      when pps.status = 'paid' then 'School admin approved ' || pr.provider_type || ' provider verification.'
      else 'School admin rejected ' || pr.provider_type || ' provider verification.'
    end,
    jsonb_build_object(
      'payment_id', pps.id,
      'provider_type', pr.provider_type,
      'provider_profile_id', pr.profile_id,
      'amount_mmk', pps.amount_mmk,
      'payment_method', pps.payment_method,
      'status', pps.status,
      'rejection_reason', pps.rejection_reason,
      'backfilled', true
    ),
    coalesce(pps.reviewed_at, pps.submitted_at)
  from public.provider_payment_submissions pps
  join public.provider_registrations pr on pr.id = pps.registration_id
  where pps.status in ('paid', 'rejected')
    and not exists (
      select 1
      from public.admin_audit_events event
      where event.entity_type = 'provider_registration'
        and event.entity_id = pps.registration_id
        and event.event_type = case when pps.status = 'paid' then 'provider_approved' else 'provider_rejected' end
        and event.metadata ->> 'payment_id' = pps.id::text
    );
  
  revoke all on table public.admin_audit_events from public;
  grant select on table public.admin_audit_events to authenticated;
  
  revoke all on function private.current_actor_role() from public;
  revoke all on function private.insert_admin_audit_event(
    text,
    uuid,
    text,
    text,
    jsonb,
    uuid,
    text,
    timestamptz
  ) from public;
  revoke all on function private.prevent_admin_audit_event_mutation() from public;
  revoke all on function private.audit_request_change() from public;
  revoke all on function private.audit_provider_payment_change() from public;
