-- Prevents tutors from requesting other tutors, and room owners from
-- requesting other hostel listings.

drop policy if exists "requests are owner-insertable" on requests;

create policy "requests are owner-insertable" on requests
  for insert with check (
    auth.uid() = profile_id
    and not (
      service_type = 'tutor'
      and exists (
        select 1
        from tutors
        where tutors.owner_profile_id = auth.uid()
      )
    )
    and not (
      service_type = 'hostel'
      and exists (
        select 1
        from hostels
        where hostels.owner_profile_id = auth.uid()
      )
    )
  );
