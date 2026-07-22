alter table profiles
  add column if not exists role text not null default 'student'
  check (role in ('student', 'driver', 'admin'));

alter table transportation_routes
  add column if not exists driver_id uuid references profiles (id) on delete set null,
  add column if not exists vehicle_number text;

create table if not exists transportation_registrations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  route_id uuid not null references transportation_routes (id) on delete cascade,
  driver_id uuid not null references profiles (id) on delete cascade,
  pickup_stop_id text not null,
  pickup_stop_name text not null,
  pickup_time text,
  pickup_address text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz
);

create unique index if not exists transportation_registrations_active_unique
  on transportation_registrations (student_id, route_id)
  where status in ('pending', 'approved');

create index if not exists transportation_registrations_driver_status_idx
  on transportation_registrations (driver_id, status, created_at desc);

create index if not exists transportation_registrations_route_idx
  on transportation_registrations (route_id);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles (id) on delete cascade,
  sender_id uuid references profiles (id) on delete set null,
  route_id uuid references transportation_routes (id) on delete cascade,
  registration_id uuid references transportation_registrations (id) on delete cascade,
  type text not null default 'transportation_registration',
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_read_idx
  on notifications (recipient_id, is_read, created_at desc);

alter table transportation_registrations enable row level security;
alter table notifications enable row level security;

create policy "students can create own transportation registrations"
  on transportation_registrations for insert
  with check (auth.uid() = student_id);

create policy "students can read own transportation registrations"
  on transportation_registrations for select
  using (auth.uid() = student_id);

create policy "drivers can read own route registrations"
  on transportation_registrations for select
  using (auth.uid() = driver_id);

create policy "drivers can update own route registrations"
  on transportation_registrations for update
  using (auth.uid() = driver_id)
  with check (auth.uid() = driver_id);

create policy "admins can manage transportation registrations"
  on transportation_registrations for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "notifications are recipient readable"
  on notifications for select
  using (auth.uid() = recipient_id);

create policy "notifications are recipient updatable"
  on notifications for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

create policy "students can create driver notifications for own registrations"
  on notifications for insert
  with check (auth.uid() = sender_id);

create policy "drivers can read requester profiles"
  on profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from transportation_registrations
      where transportation_registrations.driver_id = auth.uid()
        and transportation_registrations.student_id = profiles.id
    )
  );

create policy "drivers can update own transportation routes"
  on transportation_routes for update
  using (auth.uid() = driver_id)
  with check (auth.uid() = driver_id);

update transportation_routes
set vehicle_number = case route_name
  when 'Sanchaung - UIT Express' then 'YGN-7A-2145'
  when 'South Okkalapa - North Dagon - UIT' then 'YGN-4B-8831'
  when 'Tamwe - Bahan - UIT Line' then 'YGN-5C-4102'
  when 'Insein - Bayint Naung - UIT Ferry' then 'YGN-9D-6720'
  when 'Thingangyun - Tamwe - UIT Bus' then 'YGN-2E-3344'
  when 'Yankin - Bahan - UIT Shuttle' then 'YGN-6F-1299'
  when 'North Dagon - Thingangyun - UIT' then 'YGN-3G-9081'
  when 'Mayangone - 8 Mile - UIT' then 'YGN-8H-4507'
  when 'Ahlone - Sanchaung - UIT' then 'YGN-1J-7328'
  when 'Dagon Seikkan - Thaketa - UIT' then 'YGN-4K-5170'
  when 'Mingaladon - North Okkalapa - UIT' then 'YGN-9L-2466'
  when 'Kyimyindaing - Sanchaung - UIT' then 'YGN-5M-8013'
  else vehicle_number
end
where vehicle_number is null;

with driver_profiles as (
  select id, row_number() over (order by created_at, id) as driver_rank
  from profiles
  where role = 'driver'
  limit 2
),
ranked_routes as (
  select
    id,
    row_number() over (order by departure_time, route_name) as route_rank
  from transportation_routes
  where driver_id is null
)
update transportation_routes
set driver_id = driver_profiles.id
from ranked_routes
join driver_profiles
  on ((ranked_routes.route_rank - 1) % 2) + 1 = driver_profiles.driver_rank
where transportation_routes.id = ranked_routes.id;

with student_profiles as (
  select id, full_name, row_number() over (order by created_at, id) as student_rank
  from profiles
  where role = 'student'
  limit 2
),
assigned_routes as (
  select
    id,
    driver_id,
    route_name,
    route_stops[1] as pickup_stop_name,
    route_pickup_times[1] as pickup_time,
    row_number() over (order by departure_time, route_name) as route_rank
  from transportation_routes
  where driver_id is not null
  limit 2
),
sample_registrations as (
  select
    student_profiles.id as student_id,
    assigned_routes.id as route_id,
    assigned_routes.driver_id,
    assigned_routes.route_name,
    assigned_routes.pickup_stop_name,
    assigned_routes.pickup_time,
    case when student_profiles.student_rank = 1 then 'pending' else 'approved' end as status,
    coalesce(student_profiles.full_name, 'A student') as student_name
  from student_profiles
  join assigned_routes on assigned_routes.route_rank = student_profiles.student_rank
),
inserted_registrations as (
  insert into transportation_registrations (
    student_id,
    route_id,
    driver_id,
    pickup_stop_id,
    pickup_stop_name,
    pickup_time,
    pickup_address,
    status,
    approved_at
  )
  select
    student_id,
    route_id,
    driver_id,
    'sample-stop-1',
    pickup_stop_name,
    pickup_time,
    'Sample dormitory address for development',
    status,
    case when status = 'approved' then now() else null end
  from sample_registrations
  where not exists (
    select 1
    from transportation_registrations
    where transportation_registrations.student_id = sample_registrations.student_id
      and transportation_registrations.route_id = sample_registrations.route_id
      and transportation_registrations.status in ('pending', 'approved')
  )
  returning *
)
insert into notifications (
  recipient_id,
  sender_id,
  route_id,
  registration_id,
  type,
  title,
  message,
  is_read
)
select
  inserted_registrations.driver_id,
  inserted_registrations.student_id,
  inserted_registrations.route_id,
  inserted_registrations.id,
  'transportation_registration',
  'New seat request',
  'Development sample seat request for an assigned UIT route.',
  inserted_registrations.status = 'approved'
from inserted_registrations;
