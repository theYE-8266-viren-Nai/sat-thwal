alter table transportation_routes
  add column if not exists route_stops text[] not null default '{}';

alter table transportation_routes
  add column if not exists route_pickup_times text[] not null default '{}';

update transportation_routes
set route_stops = array[pickup_township, university]
where cardinality(route_stops) = 0;

delete from transportation_routes
where university <> 'University of Information Technology';

with sample_routes (
  driver_name,
  route_name,
  pickup_township,
  route_stops,
  route_pickup_times,
  university,
  departure_time,
  return_time,
  monthly_price,
  total_seats,
  available_seats,
  vehicle_type,
  verified
) as (
  values
    ('Ko Nay Lin', 'Sanchaung - UIT Express', 'Sanchaung', array['Sanchaung', 'Hledan', 'Hlaing', 'UIT'], array['07:00', '07:15', '07:25', '07:45'], 'University of Information Technology', '07:00'::time, '16:15'::time, 28000, 12, 6, 'Van', true),
    ('Daw May Thu', 'South Okkalapa - North Dagon - UIT', 'South Okkalapa', array['South Okkalapa', 'North Dagon', 'Hlaing', 'UIT'], array['06:30', '06:50', '07:20', '07:45'], 'University of Information Technology', '06:30'::time, '17:10'::time, 45000, 16, 6, 'Bus', true),
    ('Ko Min Thu', 'Tamwe - Bahan - UIT Line', 'Tamwe', array['Tamwe', 'Bahan', 'Hledan', 'UIT'], array['06:45', '07:00', '07:18', '07:45'], 'University of Information Technology', '06:45'::time, '16:45'::time, 34000, 12, 4, 'Van', true),
    ('Daw Khin Mar Oo', 'Insein - Bayint Naung - UIT Ferry', 'Insein', array['Insein', 'Bayint Naung', 'Hlaing', 'UIT'], array['06:50', '07:05', '07:25', '07:45'], 'University of Information Technology', '06:50'::time, '17:00'::time, 40000, 10, 2, 'Ferry + Van', true),
    ('Daw Nilar Win', 'Thingangyun - Tamwe - UIT Bus', 'Thingangyun', array['Thingangyun', 'Tamwe', 'Hledan', 'UIT'], array['06:40', '06:55', '07:25', '07:50'], 'University of Information Technology', '06:40'::time, '17:15'::time, 38000, 16, 7, 'Bus', true),
    ('Ko Htet Aung', 'Yankin - Bahan - UIT Shuttle', 'Yankin', array['Yankin', 'Bahan', 'Kamayut', 'UIT'], array['06:35', '06:50', '07:10', '07:40'], 'University of Information Technology', '06:35'::time, '16:40'::time, 36000, 14, 5, 'Van', true),
    ('Ko Aung Myint', 'North Dagon - Thingangyun - UIT', 'North Dagon', array['North Dagon', 'South Okkalapa', 'Thingangyun', 'UIT'], array['06:25', '06:45', '07:05', '07:50'], 'University of Information Technology', '06:25'::time, '17:05'::time, 43000, 15, 5, 'Bus', true),
    ('Ko Pyae Sone', 'Mayangone - 8 Mile - UIT', 'Mayangone', array['Mayangone', '8 Mile', 'Hlaing', 'UIT'], array['07:05', '07:15', '07:30', '07:45'], 'University of Information Technology', '07:05'::time, '16:20'::time, 30000, 12, 8, 'Van', true),
    ('Daw Hnin Wai', 'Ahlone - Sanchaung - UIT', 'Ahlone', array['Ahlone', 'Sanchaung', 'Hledan', 'UIT'], array['06:55', '07:10', '07:25', '07:50'], 'University of Information Technology', '06:55'::time, '16:35'::time, 35000, 13, 4, 'Van', true),
    ('Ko Hein Htet', 'Dagon Seikkan - Thaketa - UIT', 'Dagon Seikkan', array['Dagon Seikkan', 'Thaketa', 'Tamwe', 'Hledan', 'UIT'], array['06:10', '06:30', '06:55', '07:25', '07:55'], 'University of Information Technology', '06:10'::time, '17:20'::time, 48000, 18, 9, 'Bus', true),
    ('Daw Su Mon', 'Mingaladon - North Okkalapa - UIT', 'Mingaladon', array['Mingaladon', 'North Okkalapa', 'Mayangone', 'UIT'], array['06:20', '06:45', '07:10', '07:50'], 'University of Information Technology', '06:20'::time, '17:00'::time, 46000, 15, 3, 'Van', true),
    ('Ko Wai Yan', 'Kyimyindaing - Sanchaung - UIT', 'Kyimyindaing', array['Kyimyindaing', 'Sanchaung', 'Kamayut', 'UIT'], array['06:50', '07:05', '07:20', '07:45'], 'University of Information Technology', '06:50'::time, '16:30'::time, 33000, 12, 6, 'Van', true),
    ('Ko Than Lwin', 'Min Galar Don - Shwe Pyi Thar - Insein - UIT', 'Min Galar Don', array['Min Galar Don', 'Shwe Pyi Thar', 'Insein', 'UIT'], array['06:40', '07:00', '07:20', '07:50'], 'University of Information Technology', '06:40'::time, '16:40'::time, 42000, 14, 4, 'Van', true),
    ('Ko Aung Naing', 'Hlaing - UIT Express', 'Hlaing', array['Hlaing', 'UIT'], array['07:30', '07:45'], 'University of Information Technology', '07:30'::time, '16:15'::time, 28000, 14, 6, 'Van', false)
)
insert into transportation_routes (
  driver_name,
  route_name,
  pickup_township,
  route_stops,
  route_pickup_times,
  university,
  departure_time,
  return_time,
  monthly_price,
  total_seats,
  available_seats,
  vehicle_type,
  verified
)
select
  driver_name,
  route_name,
  pickup_township,
  route_stops,
  route_pickup_times,
  university,
  departure_time,
  return_time,
  monthly_price,
  total_seats,
  available_seats,
  vehicle_type,
  verified
from sample_routes
where not exists (
  select 1
  from transportation_routes
  where transportation_routes.route_name = sample_routes.route_name
);
