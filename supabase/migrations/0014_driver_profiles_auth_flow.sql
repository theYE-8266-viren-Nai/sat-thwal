create table if not exists driver_profiles (
  id uuid primary key references profiles (id) on delete cascade,
  provider_name text not null,
  service_phone text,
  township text,
  vehicle_types text[] not null default '{}',
  license_number text,
  vehicle_number text,
  notes text,
  status text not null default 'active'
    check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists driver_profiles_status_idx
  on driver_profiles (status, created_at desc);

alter table driver_profiles enable row level security;

create policy "drivers can read own driver profile"
  on driver_profiles for select
  using (auth.uid() = id);

create policy "drivers can create own driver profile"
  on driver_profiles for insert
  with check (
    auth.uid() = id
    and exists (
      select 1
      from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'driver'
    )
  );

create policy "drivers can update own driver profile"
  on driver_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "admins can manage driver profiles"
  on driver_profiles for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  assigned_role text := 'student';
begin
  if requested_role = 'driver' then
    assigned_role := 'driver';
  end if;

  insert into public.profiles (id, full_name, phone, township, role, onboarding_completed)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'township',
    assigned_role,
    assigned_role = 'driver'
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    phone = coalesce(excluded.phone, profiles.phone),
    township = coalesce(excluded.township, profiles.township),
    role = excluded.role,
    onboarding_completed = excluded.onboarding_completed,
    updated_at = now();

  if assigned_role = 'driver' then
    insert into public.driver_profiles (
      id,
      provider_name,
      service_phone,
      township,
      vehicle_types,
      license_number,
      vehicle_number,
      notes
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'provider_name', new.raw_user_meta_data ->> 'full_name', 'Driver provider'),
      new.raw_user_meta_data ->> 'phone',
      new.raw_user_meta_data ->> 'township',
      case
        when nullif(new.raw_user_meta_data ->> 'vehicle_type', '') is null then '{}'
        else array[new.raw_user_meta_data ->> 'vehicle_type']
      end,
      new.raw_user_meta_data ->> 'license_number',
      new.raw_user_meta_data ->> 'vehicle_number',
      new.raw_user_meta_data ->> 'notes'
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;
