-- Adds a student ID verification gate that runs between signup and the
-- rest of onboarding: the student photographs/uploads their student ID,
-- a server-side OpenRouter vision check confirms it looks like a real
-- student/university ID, and only then can they continue to the
-- academic-year/township/budget/subjects onboarding form.

alter table profiles
  add column if not exists student_id_verified boolean not null default false,
  add column if not exists student_id_verified_at timestamptz,
  add column if not exists student_id_image_path text;

-- Private bucket: these are identity documents, unlike tutor-photos/
-- hostel-images which are public-facing listing photos. No public read
-- policy on purpose.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('student-id-photos', 'student-id-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "student id photos are owner-readable" on storage.objects;
create policy "student id photos are owner-readable" on storage.objects
  for select using (
    bucket_id = 'student-id-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "student id photos are owner-writable" on storage.objects;
create policy "student id photos are owner-writable" on storage.objects
  for insert with check (
    bucket_id = 'student-id-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "student id photos are owner-updatable" on storage.objects;
create policy "student id photos are owner-updatable" on storage.objects
  for update using (
    bucket_id = 'student-id-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "admins can read student id photos" on storage.objects;
create policy "admins can read student id photos" on storage.objects
  for select using (
    bucket_id = 'student-id-photos'
    and public.is_admin_user(auth.uid())
  );
