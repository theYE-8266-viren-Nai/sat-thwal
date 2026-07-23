-- Fix provider publication trigger field access.
--
-- The shared trigger function from 0026 used boolean expressions like
-- `tg_table_name = 'tutors' and new.owner_profile_id is not null`. PostgreSQL
-- still resolves every field referenced in the expression against the current
-- trigger record, so firing the same function on transportation_routes raised:
-- 42703: record "new" has no field "owner_profile_id".

create or replace function private.enforce_provider_publication_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_schema = 'public' and tg_table_name = 'tutors' then
    if new.owner_profile_id is not null then
      new.verified :=
        private.provider_registration_is_active(new.owner_profile_id, 'tutor');
    end if;
  elsif tg_table_schema = 'public' and tg_table_name = 'hostels' then
    if new.owner_profile_id is not null then
      new.verified :=
        private.provider_registration_is_active(new.owner_profile_id, 'hostel');
    end if;
  elsif tg_table_schema = 'public' and tg_table_name = 'restaurants' then
    if new.owner_profile_id is not null then
      new.verified :=
        private.provider_registration_is_active(new.owner_profile_id, 'restaurant');
    end if;
  elsif tg_table_schema = 'public' and tg_table_name = 'transportation_routes' then
    if new.driver_id is not null then
      new.verified :=
        private.provider_registration_is_active(new.driver_id, 'transportation');
    end if;
  else
    raise exception 'Unsupported provider publication source: %.%', tg_table_schema, tg_table_name;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_provider_publication_state()
  from public;
