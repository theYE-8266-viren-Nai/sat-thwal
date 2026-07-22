-- Links a tutors row to the profile that created it via "Become a Tutor",
-- and allows a student to create/update their own tutor row.

alter table tutors
  add column if not exists owner_profile_id uuid references profiles (id) on delete cascade;

-- One profile can own at most one tutor row. Postgres unique constraints
-- allow multiple NULLs, so existing/seeded rows (owner_profile_id = NULL)
-- are unaffected.
alter table tutors
  add constraint tutors_owner_profile_id_key unique (owner_profile_id);

create policy "tutors are owner-insertable" on tutors
  for insert with check (auth.uid() = owner_profile_id);

create policy "tutors are owner-updatable" on tutors
  for update using (auth.uid() = owner_profile_id)
  with check (auth.uid() = owner_profile_id);
