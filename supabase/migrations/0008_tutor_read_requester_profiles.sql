-- Lets a tutor read the profile (e.g. full_name) of a student who has
-- an active request against their own tutor listing, so the incoming
-- requests inbox can show who's asking instead of a generic placeholder.

create policy "tutors can read profiles of their requesters" on profiles
  for select using (
    exists (
      select 1 from requests
      join tutors on tutors.id = requests.service_id and requests.service_type = 'tutor'
      where requests.profile_id = profiles.id and tutors.owner_profile_id = auth.uid()
    )
  );
