create index if not exists requests_profile_created_idx
  on public.requests (profile_id, created_at desc);

create index if not exists requests_service_created_idx
  on public.requests (service_type, service_id, created_at desc);

create index if not exists tutors_verified_rating_idx
  on public.tutors (rating desc)
  where verified = true;

create index if not exists hostels_verified_distance_idx
  on public.hostels (distance_km asc)
  where verified = true;

create index if not exists food_packages_enabled_price_idx
  on public.food_packages (monthly_price asc)
  where is_enabled = true;

create index if not exists transportation_routes_departure_idx
  on public.transportation_routes (departure_time asc);
