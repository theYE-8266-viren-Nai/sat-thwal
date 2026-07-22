-- Links a hostels row to the profile that created it via "List Your Room",
-- and allows a student to create/update their own room listing.

alter table hostels
  add column if not exists owner_profile_id uuid references profiles (id) on delete cascade;

-- One profile can list at most one room at a time. Postgres unique constraints
-- allow multiple NULLs, so existing/seeded rows (owner_profile_id = NULL) are unaffected.
alter table hostels
  add constraint hostels_owner_profile_id_key unique (owner_profile_id);

create policy "hostels are owner-insertable" on hostels
  for insert with check (auth.uid() = owner_profile_id);

create policy "hostels are owner-updatable" on hostels
  for update using (auth.uid() = owner_profile_id)
  with check (auth.uid() = owner_profile_id);
