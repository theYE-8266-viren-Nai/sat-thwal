-- ဆက်သွယ် Myanmar — row level security

alter table profiles enable row level security;
alter table tutors enable row level security;
alter table hostels enable row level security;
alter table restaurants enable row level security;
alter table meals enable row level security;
alter table transportation_routes enable row level security;
alter table saved_items enable row level security;
alter table requests enable row level security;

-- profiles: a student can only see and manage their own profile
create policy "profiles are self-readable" on profiles
  for select using (auth.uid() = id);

create policy "profiles are self-insertable" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles are self-updatable" on profiles
  for update using (auth.uid() = id);

-- catalog tables: publicly readable, writes are seed/admin-only (no client policy)
create policy "tutors are publicly readable" on tutors
  for select using (true);

create policy "hostels are publicly readable" on hostels
  for select using (true);

create policy "restaurants are publicly readable" on restaurants
  for select using (true);

create policy "meals are publicly readable" on meals
  for select using (true);

create policy "transportation routes are publicly readable" on transportation_routes
  for select using (true);

-- saved_items: owner-only
create policy "saved items are owner-readable" on saved_items
  for select using (auth.uid() = profile_id);

create policy "saved items are owner-insertable" on saved_items
  for insert with check (auth.uid() = profile_id);

create policy "saved items are owner-deletable" on saved_items
  for delete using (auth.uid() = profile_id);

-- requests: owner-only
create policy "requests are owner-readable" on requests
  for select using (auth.uid() = profile_id);

create policy "requests are owner-insertable" on requests
  for insert with check (auth.uid() = profile_id);

create policy "requests are owner-updatable" on requests
  for update using (auth.uid() = profile_id);
