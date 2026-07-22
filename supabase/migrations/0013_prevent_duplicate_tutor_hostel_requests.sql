-- Prevents students from creating duplicate active tutor/hostel requests
-- for the same listing. Cancelled requests can be requested again later.

with ranked_duplicate_requests as (
  select
    id,
    row_number() over (
      partition by profile_id, service_type, service_id
      order by updated_at desc, created_at desc, id desc
    ) as duplicate_rank
  from requests
  where service_type in ('tutor', 'hostel')
    and status in ('pending', 'confirmed', 'completed')
)
update requests
set
  status = 'cancelled',
  updated_at = now()
from ranked_duplicate_requests
where requests.id = ranked_duplicate_requests.id
  and ranked_duplicate_requests.duplicate_rank > 1;

create unique index if not exists requests_active_tutor_hostel_unique
  on requests (profile_id, service_type, service_id)
  where service_type in ('tutor', 'hostel')
    and status in ('pending', 'confirmed', 'completed');
