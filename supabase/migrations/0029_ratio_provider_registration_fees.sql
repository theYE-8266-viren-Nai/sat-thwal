-- Tutor and hostel provider registration fees are 15% of the listed service amount.

create or replace function private.ensure_provider_registration(
  p_profile_id uuid,
  p_provider_type text,
  p_fee_amount_mmk integer default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  registration_id uuid;
  registration_fee integer;
begin
  if p_profile_id is null then
    return null;
  end if;

  if p_fee_amount_mmk is not null then
    registration_fee := p_fee_amount_mmk;
  else
    select pfs.amount_mmk
    into registration_fee
    from public.provider_fee_schedule pfs
    where pfs.provider_type = p_provider_type
      and pfs.is_enabled;
  end if;

  if registration_fee is null then
    raise exception 'Provider registration is not enabled for %.', p_provider_type;
  end if;

  if registration_fee <= 0 then
    raise exception 'Provider registration fee must be positive.';
  end if;

  insert into public.provider_registrations (
    profile_id,
    provider_type,
    fee_amount_mmk
  )
  values (
    p_profile_id,
    p_provider_type,
    registration_fee
  )
  on conflict (profile_id, provider_type) do nothing
  returning id into registration_id;

  if registration_id is null then
    select pr.id
    into registration_id
    from public.provider_registrations pr
    where pr.profile_id = p_profile_id
      and pr.provider_type = p_provider_type;
  end if;

  return registration_id;
end;
$$;

create or replace function private.create_provider_registration_from_listing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
  registration_type text;
  registration_fee integer;
begin
  if tg_table_name = 'tutors' then
    owner_id := new.owner_profile_id;
    registration_type := 'tutor';
    registration_fee := round(new.price_per_session * 0.15)::integer;
  elsif tg_table_name = 'hostels' then
    owner_id := new.owner_profile_id;
    registration_type := 'hostel';
    registration_fee := round(new.monthly_rent * 0.15)::integer;
  elsif tg_table_name = 'driver_profiles' then
    owner_id := new.id;
    registration_type := 'transportation';
  elsif tg_table_name = 'restaurants' then
    owner_id := new.owner_profile_id;
    registration_type := 'restaurant';
  else
    raise exception 'Unsupported provider registration source: %', tg_table_name;
  end if;

  perform private.ensure_provider_registration(owner_id, registration_type, registration_fee);
  return new;
end;
$$;

update public.provider_registrations pr
set fee_amount_mmk = round(t.price_per_session * 0.15)::integer,
    updated_at = now()
from public.tutors t
where pr.provider_type = 'tutor'
  and pr.profile_id = t.owner_profile_id
  and pr.status = 'pending_payment'
  and not exists (
    select 1
    from public.provider_payment_submissions pps
    where pps.registration_id = pr.id
  );

update public.provider_registrations pr
set fee_amount_mmk = round(h.monthly_rent * 0.15)::integer,
    updated_at = now()
from public.hostels h
where pr.provider_type = 'hostel'
  and pr.profile_id = h.owner_profile_id
  and pr.status = 'pending_payment'
  and not exists (
    select 1
    from public.provider_payment_submissions pps
    where pps.registration_id = pr.id
  );

revoke all on function private.ensure_provider_registration(uuid, text, integer) from public;
revoke all on function private.ensure_provider_registration(uuid, text, integer) from anon;
revoke all on function private.ensure_provider_registration(uuid, text, integer) from authenticated;
revoke all on function private.create_provider_registration_from_listing() from public;
