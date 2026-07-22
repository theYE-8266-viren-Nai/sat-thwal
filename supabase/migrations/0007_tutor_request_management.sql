-- Lets a tutor see and respond to requests made against their own listing,
-- and tracks whether the requesting student has seen the tutor's response.

alter table requests
  add column if not exists seen_by_student boolean not null default true;

create policy "tutors can read requests for their listing" on requests
  for select using (
    service_type = 'tutor' and exists (
      select 1 from tutors where tutors.id = requests.service_id and tutors.owner_profile_id = auth.uid()
    )
  );

create policy "tutors can update requests for their listing" on requests
  for update using (
    service_type = 'tutor' and exists (
      select 1 from tutors where tutors.id = requests.service_id and tutors.owner_profile_id = auth.uid()
    )
  )
  with check (
    service_type = 'tutor' and exists (
      select 1 from tutors where tutors.id = requests.service_id and tutors.owner_profile_id = auth.uid()
    )
  );
