-- Storage buckets for tutor profile photos and hostel listing images.
-- Owners upload into a folder named after their own auth uid; buckets are
-- public so the stored URL can be saved directly into tutors.photo_url /
-- hostels.image_url (same pattern already used for those text columns).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('tutor-photos', 'tutor-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('hostel-images', 'hostel-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "tutor photos are publicly readable" on storage.objects
  for select using (bucket_id = 'tutor-photos');

create policy "tutor photos are owner-writable" on storage.objects
  for insert with check (
    bucket_id = 'tutor-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "tutor photos are owner-updatable" on storage.objects
  for update using (
    bucket_id = 'tutor-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "tutor photos are owner-deletable" on storage.objects
  for delete using (
    bucket_id = 'tutor-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "hostel images are publicly readable" on storage.objects
  for select using (bucket_id = 'hostel-images');

create policy "hostel images are owner-writable" on storage.objects
  for insert with check (
    bucket_id = 'hostel-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "hostel images are owner-updatable" on storage.objects
  for update using (
    bucket_id = 'hostel-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "hostel images are owner-deletable" on storage.objects
  for delete using (
    bucket_id = 'hostel-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
