-- Narrows the whole app to University of Information Technology (UIT) only.
-- Transportation routes were already narrowed to UIT in migration 0020;
-- this does the same for tutors/hostels (deleting the listings themselves
-- plus any requests/saved_items pointing at them, since service_id has no
-- FK to enforce that automatically) and then drops the now-redundant
-- university column everywhere it exists.

delete from requests
where service_type = 'tutor'
  and service_id in (
    select id from tutors where university <> 'University of Information Technology'
  );

delete from saved_items
where service_type = 'tutor'
  and service_id in (
    select id from tutors where university <> 'University of Information Technology'
  );

delete from requests
where service_type = 'hostel'
  and service_id in (
    select id from hostels where university <> 'University of Information Technology'
  );

delete from saved_items
where service_type = 'hostel'
  and service_id in (
    select id from hostels where university <> 'University of Information Technology'
  );

delete from tutors where university <> 'University of Information Technology';
delete from hostels where university <> 'University of Information Technology';

alter table profiles drop column if exists university;
alter table tutors drop column if exists university;
alter table hostels drop column if exists university;
alter table transportation_routes drop column if exists university;
