-- Profile select policies call these helpers as OR branches. Anonymous
-- callers still need EXECUTE permission so protected-route probes and auth
-- transitions fail closed instead of raising permission errors.
grant execute on function public.can_read_tutor_requester_profile(uuid)
  to anon, authenticated;

grant execute on function public.can_read_hostel_requester_profile(uuid)
  to anon, authenticated;

grant execute on function public.can_read_restaurant_requester_profile(uuid)
  to anon, authenticated;

grant execute on function public.can_read_transportation_requester_profile(uuid)
  to anon, authenticated;
