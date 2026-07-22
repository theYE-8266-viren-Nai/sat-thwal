-- Lets a room owner see and respond to requests made against their own
-- hostel listing, and read the requester's profile name in the inbox.

drop policy if exists "hostel owners can read requests for their listing" on requests;
create policy "hostel owners can read requests for their listing" on requests
  for select using (
    service_type = 'hostel' and exists (
      select 1 from hostels where hostels.id = requests.service_id and hostels.owner_profile_id = auth.uid()
    )
  );

drop policy if exists "hostel owners can update requests for their listing" on requests;
create policy "hostel owners can update requests for their listing" on requests
  for update using (
    service_type = 'hostel' and exists (
      select 1 from hostels where hostels.id = requests.service_id and hostels.owner_profile_id = auth.uid()
    )
  )
  with check (
    service_type = 'hostel' and exists (
      select 1 from hostels where hostels.id = requests.service_id and hostels.owner_profile_id = auth.uid()
    )
  );

drop policy if exists "hostel owners can read profiles of their requesters" on profiles;
create policy "hostel owners can read profiles of their requesters" on profiles
  for select using (
    exists (
      select 1 from requests
      join hostels on hostels.id = requests.service_id and requests.service_type = 'hostel'
      where requests.profile_id = profiles.id and hostels.owner_profile_id = auth.uid()
    )
  );
