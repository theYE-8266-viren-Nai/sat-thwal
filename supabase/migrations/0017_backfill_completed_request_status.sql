-- Ensures requests completed by both sides appear in Completed views,
-- even if an older completion flow left the status as confirmed.

update requests
set
  status = 'completed',
  completed_at = coalesce(completed_at, greatest(requester_completed_at, owner_completed_at)),
  updated_at = now()
where service_type in ('tutor', 'hostel')
  and status = 'confirmed'
  and requester_completed_at is not null
  and owner_completed_at is not null;
