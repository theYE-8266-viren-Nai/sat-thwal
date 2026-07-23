-- Give placeholder transportation route driver names distinct display names.

with replacement_names(name, position) as (
  values
    ('Ko Nay Lin', 1),
    ('Daw May Thu', 2),
    ('Ko Min Thu', 3),
    ('Daw Khin Mar Oo', 4),
    ('Ko Htet Aung', 5),
    ('Daw Nilar Win', 6),
    ('Ko Aung Myint', 7),
    ('Ko Pyae Sone', 8),
    ('Daw Hnin Wai', 9),
    ('Ko Hein Htet', 10),
    ('Daw Su Mon', 11),
    ('Ko Wai Yan', 12)
),
ranked_routes as (
  select
    id,
    row_number() over (order by created_at, route_name, id) as route_rank
  from public.transportation_routes
  where lower(btrim(driver_name)) in ('mamaphyp', 'mamaphyo')
)
update public.transportation_routes tr
set driver_name = replacement_names.name
from ranked_routes
join replacement_names
  on replacement_names.position = ((ranked_routes.route_rank - 1) % 12) + 1
where tr.id = ranked_routes.id;
