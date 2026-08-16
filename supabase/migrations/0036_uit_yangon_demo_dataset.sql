-- Curated UIT Yangon demo dataset for the admin/judging presentation.
--
-- Demo password for all seeded accounts: SatThwalDemo123!
-- All people, phone numbers, providers, and requests are fictional.

create temporary table temp_uit_demo_accounts (
  profile_id uuid primary key,
  email text not null unique,
  full_name text not null,
  role text not null,
  phone text,
  academic_year text,
  township text,
  budget_min integer,
  budget_max integer,
  preferred_subjects text[] not null default '{}',
  avatar_url text,
  student_id_verified boolean not null default true
) on commit drop;

insert into temp_uit_demo_accounts (
  profile_id,
  email,
  full_name,
  role,
  phone,
  academic_year,
  township,
  budget_min,
  budget_max,
  preferred_subjects,
  avatar_url,
  student_id_verified
) values
  ('a0000000-0000-4000-8000-000000000001', 'admin@sat-thwal.local', 'Daw Khin May Aye', 'admin', '+95 9 400 100 001', null, 'Hlaing', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=40', true),

  ('a1000000-0000-4000-8000-000000000001', 'student01@sat-thwal.local', 'Thiri Mon Htet', 'student', '+95 9 420 100 001', 'First year', 'Hlaing', 80000, 160000, array['Programming Fundamentals', 'Academic English'], 'https://i.pravatar.cc/150?img=1', true),
  ('a1000000-0000-4000-8000-000000000002', 'student02@sat-thwal.local', 'Min Thant Zin', 'student', '+95 9 420 100 002', 'Second year', 'Hledan', 90000, 180000, array['Data Structures', 'Database Systems'], 'https://i.pravatar.cc/150?img=2', true),
  ('a1000000-0000-4000-8000-000000000003', 'student03@sat-thwal.local', 'May Zin Phyo', 'student', '+95 9 420 100 003', 'Third year', 'Kamayut', 100000, 200000, array['Web Development', 'UI/UX Design'], 'https://i.pravatar.cc/150?img=3', true),
  ('a1000000-0000-4000-8000-000000000004', 'student04@sat-thwal.local', 'Aung Pyae Sone', 'student', '+95 9 420 100 004', 'Final year', 'Insein', 70000, 150000, array['Operating Systems', 'Computer Networks'], 'https://i.pravatar.cc/150?img=4', true),
  ('a1000000-0000-4000-8000-000000000005', 'student05@sat-thwal.local', 'Nandar Hlaing', 'student', '+95 9 420 100 005', 'Second year', 'Mayangone', 90000, 170000, array['Statistics', 'Data Analysis'], 'https://i.pravatar.cc/150?img=5', true),
  ('a1000000-0000-4000-8000-000000000006', 'student06@sat-thwal.local', 'Hein Htet Aung', 'student', '+95 9 420 100 006', 'First year', 'North Okkalapa', 60000, 140000, array['Programming Fundamentals'], 'https://i.pravatar.cc/150?img=6', true),
  ('a1000000-0000-4000-8000-000000000007', 'student07@sat-thwal.local', 'Yamin Oo', 'student', '+95 9 420 100 007', 'Third year', 'South Okkalapa', 110000, 210000, array['Software Engineering', 'Project Planning'], 'https://i.pravatar.cc/150?img=7', true),
  ('a1000000-0000-4000-8000-000000000008', 'student08@sat-thwal.local', 'Kyaw Zaw Lin', 'student', '+95 9 420 100 008', 'Final year', 'Tamwe', 100000, 220000, array['AI and Machine Learning', 'Python'], 'https://i.pravatar.cc/150?img=8', true),
  ('a1000000-0000-4000-8000-000000000009', 'student09@sat-thwal.local', 'Su Hnin Wai', 'student', '+95 9 420 100 009', 'Second year', 'Hlaing', 80000, 155000, array['Database Systems', 'SQL'], 'https://i.pravatar.cc/150?img=9', true),
  ('a1000000-0000-4000-8000-000000000010', 'student10@sat-thwal.local', 'Zwe Pyae Hein', 'student', '+95 9 420 100 010', 'First year', 'Hledan', 70000, 145000, array['Academic English', 'Presentation Skills'], 'https://i.pravatar.cc/150?img=10', true),
  ('a1000000-0000-4000-8000-000000000011', 'student11@sat-thwal.local', 'Ei Mon San', 'student', '+95 9 420 100 011', 'Third year', 'Kamayut', 95000, 190000, array['Mobile Development', 'Flutter'], 'https://i.pravatar.cc/150?img=11', true),
  ('a1000000-0000-4000-8000-000000000012', 'student12@sat-thwal.local', 'Nay Lin Tun', 'student', '+95 9 420 100 012', 'Final year', 'Insein', 90000, 175000, array['Cybersecurity Basics', 'Computer Networks'], 'https://i.pravatar.cc/150?img=12', true),

  ('a2100000-0000-4000-8000-000000000001', 'tutor01@sat-thwal.local', 'Aung Kyaw Zin', 'student', '+95 9 430 100 001', 'Final year', 'Hlaing', null, null, array['Programming Fundamentals', 'Python', 'C++'], 'https://i.pravatar.cc/150?img=13', true),
  ('a2100000-0000-4000-8000-000000000002', 'tutor02@sat-thwal.local', 'Pyae Sone Htun', 'student', '+95 9 430 100 002', 'Final year', 'Hledan', null, null, array['Data Structures', 'Algorithms'], 'https://i.pravatar.cc/150?img=14', true),
  ('a2100000-0000-4000-8000-000000000003', 'tutor03@sat-thwal.local', 'Nandar Htet', 'student', '+95 9 430 100 003', 'Final year', 'Kamayut', null, null, array['Database Systems', 'SQL'], 'https://i.pravatar.cc/150?img=15', true),
  ('a2100000-0000-4000-8000-000000000004', 'tutor04@sat-thwal.local', 'Kaung Myat Thu', 'student', '+95 9 430 100 004', 'Third year', 'Hledan', null, null, array['Web Development', 'React'], 'https://i.pravatar.cc/150?img=16', true),
  ('a2100000-0000-4000-8000-000000000005', 'tutor05@sat-thwal.local', 'Moe Moe Zaw', 'student', '+95 9 430 100 005', 'Third year', 'North Okkalapa', null, null, array['Statistics', 'Data Analysis'], 'https://i.pravatar.cc/150?img=17', true),
  ('a2100000-0000-4000-8000-000000000006', 'tutor06@sat-thwal.local', 'Ye Min Oo', 'student', '+95 9 430 100 006', 'Final year', 'Mayangone', null, null, array['Computer Networks', 'Cybersecurity Basics'], 'https://i.pravatar.cc/150?img=18', true),
  ('a2100000-0000-4000-8000-000000000099', 'tutor-review@sat-thwal.local', 'Hnin Ei Mon', 'student', '+95 9 430 100 099', 'Final year', 'Tamwe', null, null, array['Software Engineering', 'Testing'], 'https://i.pravatar.cc/150?img=19', true),

  ('a2200000-0000-4000-8000-000000000001', 'hostel01@sat-thwal.local', 'Daw Myint Myint San', 'student', '+95 9 440 100 001', null, 'Hlaing', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=20', true),
  ('a2200000-0000-4000-8000-000000000002', 'hostel02@sat-thwal.local', 'Daw Nilar Aye', 'student', '+95 9 440 100 002', null, 'Hledan', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=21', true),
  ('a2200000-0000-4000-8000-000000000003', 'hostel03@sat-thwal.local', 'U Than Lwin', 'student', '+95 9 440 100 003', null, 'Kamayut', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=22', true),
  ('a2200000-0000-4000-8000-000000000004', 'hostel04@sat-thwal.local', 'Daw Khin Htwe', 'student', '+95 9 440 100 004', null, 'Mayangone', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=23', true),
  ('a2200000-0000-4000-8000-000000000005', 'hostel05@sat-thwal.local', 'U Soe Min', 'student', '+95 9 440 100 005', null, 'North Okkalapa', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=24', true),
  ('a2200000-0000-4000-8000-000000000099', 'hostel-review@sat-thwal.local', 'Daw Hla Hla Win', 'student', '+95 9 440 100 099', null, 'Insein', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=25', true),

  ('a2300000-0000-4000-8000-000000000001', 'restaurant01@sat-thwal.local', 'Daw Ei Ei Mon', 'restaurant', '+95 9 450 100 001', null, 'Hledan', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=26', true),
  ('a2300000-0000-4000-8000-000000000002', 'restaurant02@sat-thwal.local', 'U Win Naing', 'restaurant', '+95 9 450 100 002', null, 'Hlaing', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=27', true),
  ('a2300000-0000-4000-8000-000000000003', 'restaurant03@sat-thwal.local', 'Daw Cho Cho Thin', 'restaurant', '+95 9 450 100 003', null, 'Kamayut', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=28', true),
  ('a2300000-0000-4000-8000-000000000004', 'restaurant04@sat-thwal.local', 'U Min Zaw', 'restaurant', '+95 9 450 100 004', null, 'Tamwe', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=29', true),
  ('a2300000-0000-4000-8000-000000000099', 'restaurant-review@sat-thwal.local', 'Daw Kay Thi Aung', 'restaurant', '+95 9 450 100 099', null, 'South Okkalapa', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=30', true),

  ('a2400000-0000-4000-8000-000000000001', 'driver01@sat-thwal.local', 'Ko Nay Lin', 'driver', '+95 9 460 100 001', null, 'Sanchaung', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=31', true),
  ('a2400000-0000-4000-8000-000000000002', 'driver02@sat-thwal.local', 'Daw May Thu', 'driver', '+95 9 460 100 002', null, 'South Okkalapa', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=32', true),
  ('a2400000-0000-4000-8000-000000000003', 'driver03@sat-thwal.local', 'Ko Min Thu', 'driver', '+95 9 460 100 003', null, 'Tamwe', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=33', true),
  ('a2400000-0000-4000-8000-000000000004', 'driver04@sat-thwal.local', 'Daw Khin Mar Oo', 'driver', '+95 9 460 100 004', null, 'Insein', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=34', true),
  ('a2400000-0000-4000-8000-000000000005', 'driver05@sat-thwal.local', 'Daw Nilar Win', 'driver', '+95 9 460 100 005', null, 'Thingangyun', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=35', true),
  ('a2400000-0000-4000-8000-000000000006', 'driver06@sat-thwal.local', 'Ko Htet Aung', 'driver', '+95 9 460 100 006', null, 'Yankin', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=36', true),
  ('a2400000-0000-4000-8000-000000000099', 'driver-review@sat-thwal.local', 'Ko Aung Myint', 'driver', '+95 9 460 100 099', null, 'North Okkalapa', null, null, array[]::text[], 'https://i.pravatar.cc/150?img=37', true);

create temporary table temp_uit_demo_profile_ids (
  profile_id uuid primary key
) on commit drop;

insert into temp_uit_demo_profile_ids (profile_id)
select id
from auth.users
where email ilike '%@sat-thwal.local'
on conflict do nothing;

insert into temp_uit_demo_profile_ids (profile_id)
select profile_id
from temp_uit_demo_accounts
on conflict do nothing;

delete from public.requests
where profile_id in (select profile_id from temp_uit_demo_profile_ids)
   or (
    service_type = 'tutor'
    and service_id in (
      select id
      from public.tutors
      where owner_profile_id is null
         or owner_profile_id in (select profile_id from temp_uit_demo_profile_ids)
    )
  )
   or (
    service_type = 'hostel'
    and service_id in (
      select id
      from public.hostels
      where owner_profile_id is null
         or owner_profile_id in (select profile_id from temp_uit_demo_profile_ids)
    )
  )
   or (
    service_type = 'food'
    and service_id in (
      select fp.id
      from public.food_packages fp
      join public.restaurants r on r.id = fp.restaurant_id
      where r.owner_profile_id is null
         or r.owner_profile_id in (select profile_id from temp_uit_demo_profile_ids)
    )
  )
   or (
    service_type = 'transportation'
    and service_id in (
      select id
      from public.transportation_routes
      where route_name ilike '%UIT%'
         or driver_id is null
         or driver_id in (select profile_id from temp_uit_demo_profile_ids)
    )
  );

delete from public.saved_items
where profile_id in (select profile_id from temp_uit_demo_profile_ids)
   or (
    service_type = 'tutor'
    and service_id in (
      select id
      from public.tutors
      where owner_profile_id is null
         or owner_profile_id in (select profile_id from temp_uit_demo_profile_ids)
    )
  )
   or (
    service_type = 'hostel'
    and service_id in (
      select id
      from public.hostels
      where owner_profile_id is null
         or owner_profile_id in (select profile_id from temp_uit_demo_profile_ids)
    )
  )
   or (
    service_type = 'food'
    and service_id in (
      select fp.id
      from public.food_packages fp
      join public.restaurants r on r.id = fp.restaurant_id
      where r.owner_profile_id is null
         or r.owner_profile_id in (select profile_id from temp_uit_demo_profile_ids)
    )
  )
   or (
    service_type = 'transportation'
    and service_id in (
      select id
      from public.transportation_routes
      where route_name ilike '%UIT%'
         or driver_id is null
         or driver_id in (select profile_id from temp_uit_demo_profile_ids)
    )
  );

delete from public.transportation_routes
where route_name ilike '%UIT%'
   or driver_id is null
   or driver_id in (select profile_id from temp_uit_demo_profile_ids);

delete from public.restaurants
where owner_profile_id is null
   or owner_profile_id in (select profile_id from temp_uit_demo_profile_ids);

delete from public.hostels
where owner_profile_id is null
   or owner_profile_id in (select profile_id from temp_uit_demo_profile_ids);

delete from public.tutors
where owner_profile_id is null
   or owner_profile_id in (select profile_id from temp_uit_demo_profile_ids);

delete from public.provider_payment_submissions
where registration_id in (
  select id
  from public.provider_registrations
  where profile_id in (select profile_id from temp_uit_demo_profile_ids)
);

delete from public.provider_registrations
where profile_id in (select profile_id from temp_uit_demo_profile_ids);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  profile_id,
  'authenticated',
  'authenticated',
  email,
  crypt('SatThwalDemo123!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('full_name', full_name, 'role', role),
  now(),
  now()
from temp_uit_demo_accounts
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = coalesce(auth.users.email_confirmed_at, excluded.email_confirmed_at),
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  profile_id,
  profile_id,
  profile_id::text,
  jsonb_build_object('sub', profile_id::text, 'email', email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
from temp_uit_demo_accounts
on conflict (provider_id, provider) do update
set
  identity_data = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = now();

insert into public.profiles (
  id,
  full_name,
  avatar_url,
  phone,
  academic_year,
  township,
  budget_min,
  budget_max,
  preferred_subjects,
  language_preference,
  notification_opt_in,
  onboarding_completed,
  student_id_verified,
  student_id_verified_at,
  role
)
select
  profile_id,
  full_name,
  avatar_url,
  phone,
  academic_year,
  township,
  budget_min,
  budget_max,
  preferred_subjects,
  'en',
  true,
  true,
  student_id_verified,
  case when student_id_verified then '2026-07-15 09:00:00+06:30'::timestamptz else null end,
  role
from temp_uit_demo_accounts
on conflict (id) do update
set
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  phone = excluded.phone,
  academic_year = excluded.academic_year,
  township = excluded.township,
  budget_min = excluded.budget_min,
  budget_max = excluded.budget_max,
  preferred_subjects = excluded.preferred_subjects,
  language_preference = excluded.language_preference,
  notification_opt_in = excluded.notification_opt_in,
  onboarding_completed = excluded.onboarding_completed,
  student_id_verified = excluded.student_id_verified,
  student_id_verified_at = excluded.student_id_verified_at,
  role = excluded.role,
  updated_at = now();

insert into public.driver_profiles (
  id,
  provider_name,
  service_phone,
  township,
  vehicle_types,
  license_number,
  vehicle_number,
  notes,
  status
) values
  ('a2400000-0000-4000-8000-000000000001', 'Ko Nay Lin Transport', '+95 9 460 100 001', 'Sanchaung', array['Van'], 'UIT-DL-001', 'YGN-7A-2145', 'Approved UIT commute provider.', 'pending'),
  ('a2400000-0000-4000-8000-000000000002', 'Daw May Thu Ferry Service', '+95 9 460 100 002', 'South Okkalapa', array['Bus'], 'UIT-DL-002', 'YGN-4B-8831', 'Approved UIT commute provider.', 'pending'),
  ('a2400000-0000-4000-8000-000000000003', 'Ko Min Thu Campus Line', '+95 9 460 100 003', 'Tamwe', array['Van'], 'UIT-DL-003', 'YGN-5C-4102', 'Approved UIT commute provider.', 'pending'),
  ('a2400000-0000-4000-8000-000000000004', 'Daw Khin Mar Oo Ferry', '+95 9 460 100 004', 'Insein', array['Ferry + Van'], 'UIT-DL-004', 'YGN-9D-6720', 'Approved UIT commute provider.', 'pending'),
  ('a2400000-0000-4000-8000-000000000005', 'Daw Nilar Win Bus Service', '+95 9 460 100 005', 'Thingangyun', array['Bus'], 'UIT-DL-005', 'YGN-2E-3344', 'Approved UIT commute provider.', 'pending'),
  ('a2400000-0000-4000-8000-000000000006', 'Ko Htet Aung Shuttle', '+95 9 460 100 006', 'Yankin', array['Van'], 'UIT-DL-006', 'YGN-6F-1299', 'Approved UIT commute provider.', 'pending'),
  ('a2400000-0000-4000-8000-000000000099', 'Ko Aung Myint Review Route', '+95 9 460 100 099', 'North Okkalapa', array['Bus'], 'UIT-DL-099', 'YGN-3G-9081', 'Pending route verification for the approval queue.', 'pending')
on conflict (id) do update
set
  provider_name = excluded.provider_name,
  service_phone = excluded.service_phone,
  township = excluded.township,
  vehicle_types = excluded.vehicle_types,
  license_number = excluded.license_number,
  vehicle_number = excluded.vehicle_number,
  notes = excluded.notes,
  updated_at = now();

create temporary table temp_uit_demo_provider_regs (
  profile_id uuid primary key,
  provider_type text not null,
  fee_amount_mmk integer not null,
  status text not null
) on commit drop;

insert into temp_uit_demo_provider_regs values
  ('a2100000-0000-4000-8000-000000000001', 'tutor', 1200, 'active'),
  ('a2100000-0000-4000-8000-000000000002', 'tutor', 1425, 'active'),
  ('a2100000-0000-4000-8000-000000000003', 'tutor', 1350, 'active'),
  ('a2100000-0000-4000-8000-000000000004', 'tutor', 1275, 'active'),
  ('a2100000-0000-4000-8000-000000000005', 'tutor', 1125, 'active'),
  ('a2100000-0000-4000-8000-000000000006', 'tutor', 1350, 'active'),
  ('a2100000-0000-4000-8000-000000000099', 'tutor', 1500, 'payment_review'),
  ('a2200000-0000-4000-8000-000000000001', 'hostel', 22500, 'active'),
  ('a2200000-0000-4000-8000-000000000002', 'hostel', 20250, 'active'),
  ('a2200000-0000-4000-8000-000000000003', 'hostel', 21750, 'active'),
  ('a2200000-0000-4000-8000-000000000004', 'hostel', 18750, 'active'),
  ('a2200000-0000-4000-8000-000000000005', 'hostel', 14250, 'active'),
  ('a2200000-0000-4000-8000-000000000099', 'hostel', 16500, 'payment_review'),
  ('a2300000-0000-4000-8000-000000000001', 'restaurant', 20000, 'active'),
  ('a2300000-0000-4000-8000-000000000002', 'restaurant', 20000, 'active'),
  ('a2300000-0000-4000-8000-000000000003', 'restaurant', 20000, 'active'),
  ('a2300000-0000-4000-8000-000000000004', 'restaurant', 20000, 'active'),
  ('a2300000-0000-4000-8000-000000000099', 'restaurant', 20000, 'payment_review'),
  ('a2400000-0000-4000-8000-000000000001', 'transportation', 3000, 'active'),
  ('a2400000-0000-4000-8000-000000000002', 'transportation', 3000, 'active'),
  ('a2400000-0000-4000-8000-000000000003', 'transportation', 3000, 'active'),
  ('a2400000-0000-4000-8000-000000000004', 'transportation', 3000, 'active'),
  ('a2400000-0000-4000-8000-000000000005', 'transportation', 3000, 'active'),
  ('a2400000-0000-4000-8000-000000000006', 'transportation', 3000, 'active'),
  ('a2400000-0000-4000-8000-000000000099', 'transportation', 3000, 'payment_review');

insert into public.provider_registrations (
  profile_id,
  provider_type,
  fee_amount_mmk,
  status,
  activated_at,
  created_at,
  updated_at
)
select
  profile_id,
  provider_type,
  fee_amount_mmk,
  status,
  case when status = 'active' then '2026-07-16 10:00:00+06:30'::timestamptz else null end,
  '2026-07-15 09:30:00+06:30'::timestamptz,
  '2026-07-16 10:00:00+06:30'::timestamptz
from temp_uit_demo_provider_regs
on conflict (profile_id, provider_type) do update
set
  fee_amount_mmk = excluded.fee_amount_mmk,
  status = excluded.status,
  activated_at = excluded.activated_at,
  updated_at = excluded.updated_at;

update public.driver_profiles dp
set
  status = case when regs.status = 'active' then 'active' else 'pending' end,
  updated_at = now()
from temp_uit_demo_provider_regs regs
where dp.id = regs.profile_id
  and regs.provider_type = 'transportation';

insert into public.provider_payment_submissions (
  registration_id,
  amount_mmk,
  payment_method,
  transaction_reference,
  status,
  submitted_at,
  reviewed_at,
  reviewed_by
)
select
  pr.id,
  pr.fee_amount_mmk,
  case pr.provider_type
    when 'restaurant' then 'bank_transfer'
    when 'transportation' then 'wavepay'
    else 'kbzpay'
  end,
  'UIT-DEMO-' || upper(pr.provider_type) || '-' || right(pr.profile_id::text, 4),
  case when pr.status = 'active' then 'paid' else 'submitted' end,
  '2026-07-15 11:00:00+06:30'::timestamptz,
  case when pr.status = 'active' then '2026-07-16 10:00:00+06:30'::timestamptz else null end,
  case when pr.status = 'active' then 'a0000000-0000-4000-8000-000000000001'::uuid else null end
from public.provider_registrations pr
where pr.profile_id in (select profile_id from temp_uit_demo_provider_regs)
  and not exists (
    select 1
    from public.admin_audit_events existing_event
    where existing_event.entity_type = 'provider_registration'
      and existing_event.entity_id = pr.id
      and existing_event.event_type = case
        when pr.status = 'active' then 'provider_approved'
        else 'provider_payment_submitted'
      end
      and existing_event.metadata ->> 'demo_dataset' = 'uit-yangon-2026'
  );

insert into public.tutors (
  id,
  name,
  photo_url,
  subjects,
  township,
  bio,
  rating,
  review_count,
  price_per_session,
  session_mode,
  availability_note,
  verified,
  owner_profile_id,
  created_at
) values
  ('b1000000-0000-4000-8000-000000000001', 'Aung Kyaw Zin', 'https://i.pravatar.cc/150?img=13', array['Programming Fundamentals', 'Python', 'C++'], 'Hlaing', 'UIT final-year tutor for first-year programming, lab practice, and assignment review.', 4.8, 42, 8000, 'both', 'Weekday evenings and Saturday mornings', true, 'a2100000-0000-4000-8000-000000000001', '2026-07-16 12:00:00+06:30'),
  ('b1000000-0000-4000-8000-000000000002', 'Pyae Sone Htun', 'https://i.pravatar.cc/150?img=14', array['Data Structures', 'Algorithms', 'Exam Revision'], 'Hledan', 'Data structures tutor using small visual examples for lists, trees, graphs, and sorting.', 4.8, 46, 9500, 'both', 'Tuesday, Thursday, and Sunday', true, 'a2100000-0000-4000-8000-000000000002', '2026-07-16 12:00:00+06:30'),
  ('b1000000-0000-4000-8000-000000000003', 'Nandar Htet', 'https://i.pravatar.cc/150?img=15', array['Database Systems', 'SQL', 'ERD Design'], 'Kamayut', 'Database tutor for SQL practice, normalization, ER diagrams, and project schema review.', 4.7, 31, 9000, 'both', 'Monday, Wednesday, and Sunday', true, 'a2100000-0000-4000-8000-000000000003', '2026-07-16 12:00:00+06:30'),
  ('b1000000-0000-4000-8000-000000000004', 'Kaung Myat Thu', 'https://i.pravatar.cc/150?img=16', array['Web Development', 'JavaScript', 'React'], 'Hledan', 'Project-based tutor for React components, forms, routing, and Supabase-backed assignments.', 4.7, 33, 8500, 'both', 'Flexible scheduling', true, 'a2100000-0000-4000-8000-000000000004', '2026-07-16 12:00:00+06:30'),
  ('b1000000-0000-4000-8000-000000000005', 'Moe Moe Zaw', 'https://i.pravatar.cc/150?img=17', array['Statistics', 'Probability', 'Data Analysis'], 'North Okkalapa', 'Patient statistics tutor for probability, assignments, exam revision, and data analysis practice.', 4.6, 28, 7500, 'online', 'Weekday mornings', true, 'a2100000-0000-4000-8000-000000000005', '2026-07-16 12:00:00+06:30'),
  ('b1000000-0000-4000-8000-000000000006', 'Ye Min Oo', 'https://i.pravatar.cc/150?img=18', array['Computer Networks', 'Subnetting', 'Cybersecurity Basics'], 'Mayangone', 'Network fundamentals tutor using simple labs for protocols, subnetting, and security basics.', 4.5, 24, 9000, 'online', 'Friday evenings and weekends', true, 'a2100000-0000-4000-8000-000000000006', '2026-07-16 12:00:00+06:30')
on conflict (id) do update
set
  name = excluded.name,
  photo_url = excluded.photo_url,
  subjects = excluded.subjects,
  township = excluded.township,
  bio = excluded.bio,
  rating = excluded.rating,
  review_count = excluded.review_count,
  price_per_session = excluded.price_per_session,
  session_mode = excluded.session_mode,
  availability_note = excluded.availability_note,
  verified = excluded.verified,
  owner_profile_id = excluded.owner_profile_id;

insert into public.hostels (
  id,
  name,
  image_url,
  township,
  distance_km,
  monthly_rent,
  gender_policy,
  room_type,
  facilities,
  available_rooms,
  meals_included,
  description,
  verified,
  owner_profile_id,
  created_at
) values
  ('b2000000-0000-4000-8000-000000000001', 'UIT Hlaing Residence', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600', 'Hlaing', 0.5, 150000, 'male', 'Shared (2-bed)', array['Wi-Fi', 'Laundry', 'Study Room', 'CCTV'], 4, true, 'Male hostel near UIT main gate with study spaces, laundry access, and breakfast plus dinner included.', true, 'a2200000-0000-4000-8000-000000000001', '2026-07-16 12:15:00+06:30'),
  ('b2000000-0000-4000-8000-000000000002', 'Hledan Golden Girls Hostel', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600', 'Hledan', 1.1, 135000, 'female', 'Shared (4-bed)', array['Wi-Fi', 'Security Guard', 'Study Room', 'Water Purifier'], 6, false, 'Female-only hostel around Hledan with easy bus access to UIT and a quiet study-friendly setup.', true, 'a2200000-0000-4000-8000-000000000002', '2026-07-16 12:15:00+06:30'),
  ('b2000000-0000-4000-8000-000000000003', 'Kamayut Student House', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600', 'Kamayut', 1.8, 145000, 'mixed', 'Shared (2-bed)', array['Wi-Fi', 'Kitchen Access', 'Hot Water', 'Common Room'], 5, false, 'Mixed student house for UIT students who need privacy, shared kitchen access, and commute options.', true, 'a2200000-0000-4000-8000-000000000003', '2026-07-16 12:15:00+06:30'),
  ('b2000000-0000-4000-8000-000000000004', 'Mayangone Comfort Hostel', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600', 'Mayangone', 2.6, 125000, 'female', 'Shared (3-bed)', array['Wi-Fi', 'Laundry', 'Security Guard', 'Backup Power'], 5, true, 'Female hostel with meal support, backup power, and a calm environment for regular study routines.', true, 'a2200000-0000-4000-8000-000000000004', '2026-07-16 12:15:00+06:30'),
  ('b2000000-0000-4000-8000-000000000005', 'North Okkalapa Green House', 'https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=600', 'North Okkalapa', 4.0, 95000, 'mixed', 'Shared (4-bed)', array['Wi-Fi', 'Garden', 'Kitchen Access', 'Security Guard'], 7, true, 'Budget-friendly hostel with home-style meals and garden space for students watching monthly costs.', true, 'a2200000-0000-4000-8000-000000000005', '2026-07-16 12:15:00+06:30')
on conflict (id) do update
set
  name = excluded.name,
  image_url = excluded.image_url,
  township = excluded.township,
  distance_km = excluded.distance_km,
  monthly_rent = excluded.monthly_rent,
  gender_policy = excluded.gender_policy,
  room_type = excluded.room_type,
  facilities = excluded.facilities,
  available_rooms = excluded.available_rooms,
  meals_included = excluded.meals_included,
  description = excluded.description,
  verified = excluded.verified,
  owner_profile_id = excluded.owner_profile_id;

insert into public.restaurants (
  id,
  name,
  image_url,
  township,
  distance_km,
  rating,
  delivery,
  pickup,
  vegetarian_options,
  halal,
  opening_hours,
  student_discount_percent,
  verified,
  owner_profile_id,
  created_at
) values
  ('b3000000-0000-4000-8000-000000000001', 'Hledan Campus Meals', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600', 'Hledan', 0.8, 4.6, true, true, true, false, '6:30 AM - 8:30 PM', 10, true, 'a2300000-0000-4000-8000-000000000001', '2026-07-16 12:30:00+06:30'),
  ('b3000000-0000-4000-8000-000000000002', 'Hlaing Student Tiffin', 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=600', 'Hlaing', 0.5, 4.5, true, true, true, false, '6:00 AM - 9:00 PM', 15, true, 'a2300000-0000-4000-8000-000000000002', '2026-07-16 12:30:00+06:30'),
  ('b3000000-0000-4000-8000-000000000003', 'Kamayut Healthy Bowl', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 'Kamayut', 1.4, 4.7, false, true, true, false, '9:00 AM - 8:00 PM', 5, true, 'a2300000-0000-4000-8000-000000000003', '2026-07-16 12:30:00+06:30'),
  ('b3000000-0000-4000-8000-000000000004', 'Tamwe Halal Kitchen', 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600', 'Tamwe', 2.8, 4.6, true, true, true, true, '10:00 AM - 9:00 PM', 10, true, 'a2300000-0000-4000-8000-000000000004', '2026-07-16 12:30:00+06:30')
on conflict (id) do update
set
  name = excluded.name,
  image_url = excluded.image_url,
  township = excluded.township,
  distance_km = excluded.distance_km,
  rating = excluded.rating,
  delivery = excluded.delivery,
  pickup = excluded.pickup,
  vegetarian_options = excluded.vegetarian_options,
  halal = excluded.halal,
  opening_hours = excluded.opening_hours,
  student_discount_percent = excluded.student_discount_percent,
  verified = excluded.verified,
  owner_profile_id = excluded.owner_profile_id;

insert into public.food_packages (
  id,
  restaurant_id,
  package_type,
  name,
  monthly_price,
  max_subscribers,
  is_enabled,
  created_at,
  updated_at
) values
  ('b4000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'breakfast_lunch', 'Hledan Breakfast + Lunch Plan', 125000, 35, true, '2026-07-16 13:00:00+06:30', '2026-07-16 13:00:00+06:30'),
  ('b4000000-0000-4000-8000-000000000002', 'b3000000-0000-4000-8000-000000000001', 'breakfast_lunch_dinner', 'Hledan Full-Day Meal Plan', 180000, 25, true, '2026-07-16 13:00:00+06:30', '2026-07-16 13:00:00+06:30'),
  ('b4000000-0000-4000-8000-000000000003', 'b3000000-0000-4000-8000-000000000002', 'breakfast_dinner', 'Hlaing Breakfast + Dinner Plan', 130000, 30, true, '2026-07-16 13:00:00+06:30', '2026-07-16 13:00:00+06:30'),
  ('b4000000-0000-4000-8000-000000000004', 'b3000000-0000-4000-8000-000000000002', 'lunch_dinner', 'Hlaing Lunch + Dinner Plan', 140000, 30, true, '2026-07-16 13:00:00+06:30', '2026-07-16 13:00:00+06:30'),
  ('b4000000-0000-4000-8000-000000000005', 'b3000000-0000-4000-8000-000000000003', 'breakfast_lunch', 'Kamayut Healthy Day Plan', 135000, 28, true, '2026-07-16 13:00:00+06:30', '2026-07-16 13:00:00+06:30'),
  ('b4000000-0000-4000-8000-000000000006', 'b3000000-0000-4000-8000-000000000003', 'lunch_dinner', 'Kamayut Study Meal Plan', 145000, 24, true, '2026-07-16 13:00:00+06:30', '2026-07-16 13:00:00+06:30'),
  ('b4000000-0000-4000-8000-000000000007', 'b3000000-0000-4000-8000-000000000004', 'breakfast_dinner', 'Tamwe Halal Breakfast + Dinner', 138000, 26, true, '2026-07-16 13:00:00+06:30', '2026-07-16 13:00:00+06:30'),
  ('b4000000-0000-4000-8000-000000000008', 'b3000000-0000-4000-8000-000000000004', 'breakfast_lunch_dinner', 'Tamwe Halal Full-Day Plan', 188000, 20, true, '2026-07-16 13:00:00+06:30', '2026-07-16 13:00:00+06:30')
on conflict (restaurant_id, package_type) do update
set
  name = excluded.name,
  monthly_price = excluded.monthly_price,
  max_subscribers = excluded.max_subscribers,
  is_enabled = excluded.is_enabled,
  updated_at = excluded.updated_at;

insert into public.transportation_routes (
  id,
  driver_name,
  route_name,
  pickup_township,
  route_stops,
  route_pickup_times,
  departure_time,
  return_time,
  monthly_price,
  total_seats,
  available_seats,
  vehicle_type,
  vehicle_number,
  driver_id,
  verified,
  created_at
) values
  ('11111111-1111-4111-8111-111111111111', 'Ko Nay Lin', 'Sanchaung - UIT Express', 'Sanchaung', array['Sanchaung', 'Hledan', 'Hlaing', 'UIT'], array['07:00', '07:15', '07:25', '07:45'], '07:00', '16:15', 28000, 12, 6, 'Van', 'YGN-7A-2145', 'a2400000-0000-4000-8000-000000000001', true, '2026-07-16 13:30:00+06:30'),
  ('22222222-2222-4222-8222-222222222222', 'Daw May Thu', 'South Okkalapa - North Dagon - UIT', 'South Okkalapa', array['South Okkalapa', 'North Dagon', 'Hlaing', 'UIT'], array['06:30', '06:50', '07:20', '07:45'], '06:30', '17:10', 45000, 16, 6, 'Bus', 'YGN-4B-8831', 'a2400000-0000-4000-8000-000000000002', true, '2026-07-16 13:30:00+06:30'),
  ('33333333-3333-4333-8333-333333333333', 'Ko Min Thu', 'Tamwe - Bahan - UIT Line', 'Tamwe', array['Tamwe', 'Bahan', 'Hledan', 'UIT'], array['06:45', '07:00', '07:18', '07:45'], '06:45', '16:45', 34000, 12, 4, 'Van', 'YGN-5C-4102', 'a2400000-0000-4000-8000-000000000003', true, '2026-07-16 13:30:00+06:30'),
  ('44444444-4444-4444-8444-444444444444', 'Daw Khin Mar Oo', 'Insein - Bayint Naung - UIT Ferry', 'Insein', array['Insein', 'Bayint Naung', 'Hlaing', 'UIT'], array['06:50', '07:05', '07:25', '07:45'], '06:50', '17:00', 40000, 10, 2, 'Ferry + Van', 'YGN-9D-6720', 'a2400000-0000-4000-8000-000000000004', true, '2026-07-16 13:30:00+06:30'),
  ('55555555-5555-4555-8555-555555555555', 'Daw Nilar Win', 'Thingangyun - Tamwe - UIT Bus', 'Thingangyun', array['Thingangyun', 'Tamwe', 'Hledan', 'UIT'], array['06:40', '06:55', '07:25', '07:50'], '06:40', '17:15', 38000, 16, 7, 'Bus', 'YGN-2E-3344', 'a2400000-0000-4000-8000-000000000005', true, '2026-07-16 13:30:00+06:30'),
  ('66666666-6666-4666-8666-666666666666', 'Ko Htet Aung', 'Yankin - Bahan - UIT Shuttle', 'Yankin', array['Yankin', 'Bahan', 'Kamayut', 'UIT'], array['06:35', '06:50', '07:10', '07:40'], '06:35', '16:40', 36000, 14, 5, 'Van', 'YGN-6F-1299', 'a2400000-0000-4000-8000-000000000006', true, '2026-07-16 13:30:00+06:30'),
  ('77777777-7777-4777-8777-777777777777', 'Ko Nay Lin', 'North Dagon - Thingangyun - UIT', 'North Dagon', array['North Dagon', 'South Okkalapa', 'Thingangyun', 'UIT'], array['06:25', '06:45', '07:05', '07:50'], '06:25', '17:05', 43000, 15, 5, 'Bus', 'YGN-3G-9081', 'a2400000-0000-4000-8000-000000000001', true, '2026-07-16 13:30:00+06:30'),
  ('88888888-8888-4888-8888-888888888888', 'Daw May Thu', 'Mayangone - 8 Mile - UIT', 'Mayangone', array['Mayangone', '8 Mile', 'Hlaing', 'UIT'], array['07:05', '07:15', '07:30', '07:45'], '07:05', '16:20', 30000, 12, 8, 'Van', 'YGN-8H-4507', 'a2400000-0000-4000-8000-000000000002', true, '2026-07-16 13:30:00+06:30'),
  ('99999999-9999-4999-8999-999999999999', 'Ko Min Thu', 'Ahlone - Sanchaung - UIT', 'Ahlone', array['Ahlone', 'Sanchaung', 'Hledan', 'UIT'], array['06:55', '07:10', '07:25', '07:50'], '06:55', '16:35', 35000, 13, 4, 'Van', 'YGN-1J-7328', 'a2400000-0000-4000-8000-000000000003', true, '2026-07-16 13:30:00+06:30'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Daw Khin Mar Oo', 'Dagon Seikkan - Thaketa - UIT', 'Dagon Seikkan', array['Dagon Seikkan', 'Thaketa', 'Tamwe', 'Hledan', 'UIT'], array['06:10', '06:30', '06:55', '07:25', '07:55'], '06:10', '17:20', 48000, 18, 9, 'Bus', 'YGN-4K-5170', 'a2400000-0000-4000-8000-000000000004', true, '2026-07-16 13:30:00+06:30'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Daw Nilar Win', 'Mingaladon - North Okkalapa - UIT', 'Mingaladon', array['Mingaladon', 'North Okkalapa', 'Mayangone', 'UIT'], array['06:20', '06:45', '07:10', '07:50'], '06:20', '17:00', 46000, 15, 3, 'Van', 'YGN-9L-2466', 'a2400000-0000-4000-8000-000000000005', true, '2026-07-16 13:30:00+06:30'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Ko Htet Aung', 'Kyimyindaing - Sanchaung - UIT', 'Kyimyindaing', array['Kyimyindaing', 'Sanchaung', 'Kamayut', 'UIT'], array['06:50', '07:05', '07:20', '07:45'], '06:50', '16:30', 33000, 12, 6, 'Van', 'YGN-5M-8013', 'a2400000-0000-4000-8000-000000000006', true, '2026-07-16 13:30:00+06:30')
on conflict (id) do update
set
  driver_name = excluded.driver_name,
  route_name = excluded.route_name,
  pickup_township = excluded.pickup_township,
  route_stops = excluded.route_stops,
  route_pickup_times = excluded.route_pickup_times,
  departure_time = excluded.departure_time,
  return_time = excluded.return_time,
  monthly_price = excluded.monthly_price,
  total_seats = excluded.total_seats,
  available_seats = excluded.available_seats,
  vehicle_type = excluded.vehicle_type,
  vehicle_number = excluded.vehicle_number,
  driver_id = excluded.driver_id,
  verified = excluded.verified;

insert into public.requests (
  id,
  profile_id,
  service_type,
  service_id,
  status,
  note,
  pickup_stop_id,
  pickup_stop_name,
  pickup_time,
  pickup_address,
  rejection_reason,
  seen_by_student,
  requester_completed_at,
  owner_completed_at,
  completed_at,
  created_at,
  updated_at
) values
  ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'tutor', 'b1000000-0000-4000-8000-000000000001', 'pending', 'Needs weekly programming practice before first semester exams.', null, null, null, null, null, true, null, null, null, '2026-07-20 09:10:00+06:30', '2026-07-20 09:10:00+06:30'),
  ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 'tutor', 'b1000000-0000-4000-8000-000000000002', 'confirmed', 'Requests help with tree traversal and sorting revision.', null, null, null, null, null, false, null, null, null, '2026-07-21 10:25:00+06:30', '2026-07-22 15:40:00+06:30'),
  ('c1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003', 'tutor', 'b1000000-0000-4000-8000-000000000004', 'completed', 'Wanted React project review before presentation week.', null, null, null, null, null, true, '2026-07-27 17:00:00+06:30', '2026-07-27 16:30:00+06:30', '2026-07-27 17:00:00+06:30', '2026-07-23 11:00:00+06:30', '2026-07-27 17:00:00+06:30'),
  ('c1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004', 'tutor', 'b1000000-0000-4000-8000-000000000006', 'pending', 'Needs help with subnetting examples.', null, null, null, null, null, true, null, null, null, '2026-07-29 08:30:00+06:30', '2026-07-29 08:30:00+06:30'),
  ('c1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000005', 'tutor', 'b1000000-0000-4000-8000-000000000005', 'confirmed', 'Statistics assignment support requested.', null, null, null, null, null, false, null, null, null, '2026-08-01 13:15:00+06:30', '2026-08-02 09:20:00+06:30'),
  ('c1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000006', 'tutor', 'b1000000-0000-4000-8000-000000000003', 'cancelled', 'Timing did not match the student schedule.', null, null, null, null, 'Tutor schedule unavailable for the requested week.', false, null, null, null, '2026-08-03 14:00:00+06:30', '2026-08-04 10:00:00+06:30'),

  ('c1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000007', 'hostel', 'b2000000-0000-4000-8000-000000000003', 'pending', 'Looking for a study-friendly room near a regular bus route.', null, null, null, null, null, true, null, null, null, '2026-07-20 12:45:00+06:30', '2026-07-20 12:45:00+06:30'),
  ('c1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000008', 'hostel', 'b2000000-0000-4000-8000-000000000002', 'confirmed', 'Needs female-only hostel for exam preparation period.', null, null, null, null, null, false, null, null, null, '2026-07-21 16:30:00+06:30', '2026-07-22 09:10:00+06:30'),
  ('c1000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000009', 'hostel', 'b2000000-0000-4000-8000-000000000001', 'completed', 'Room inspection and student placement completed.', null, null, null, null, null, true, '2026-07-26 15:20:00+06:30', '2026-07-26 15:05:00+06:30', '2026-07-26 15:20:00+06:30', '2026-07-22 11:20:00+06:30', '2026-07-26 15:20:00+06:30'),
  ('c1000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000010', 'hostel', 'b2000000-0000-4000-8000-000000000005', 'confirmed', 'Budget room requested with meal support.', null, null, null, null, null, false, null, null, null, '2026-07-30 09:45:00+06:30', '2026-07-31 13:30:00+06:30'),
  ('c1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000011', 'hostel', 'b2000000-0000-4000-8000-000000000004', 'completed', 'Student confirmed room after owner follow-up.', null, null, null, null, null, true, '2026-08-03 18:10:00+06:30', '2026-08-03 17:40:00+06:30', '2026-08-03 18:10:00+06:30', '2026-08-01 10:15:00+06:30', '2026-08-03 18:10:00+06:30'),
  ('c1000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000012', 'hostel', 'b2000000-0000-4000-8000-000000000003', 'cancelled', 'Room was no longer available after review.', null, null, null, null, 'All listed beds were reserved before confirmation.', false, null, null, null, '2026-08-05 11:10:00+06:30', '2026-08-06 09:10:00+06:30'),

  ('c1000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000001', 'food', 'b4000000-0000-4000-8000-000000000001', 'pending', 'Needs breakfast and lunch support during lab weeks.', null, null, null, null, null, true, null, null, null, '2026-07-24 08:20:00+06:30', '2026-07-24 08:20:00+06:30'),
  ('c1000000-0000-4000-8000-000000000014', 'a1000000-0000-4000-8000-000000000002', 'food', 'b4000000-0000-4000-8000-000000000003', 'confirmed', 'Breakfast and dinner plan requested for commute days.', null, null, null, null, null, false, null, null, null, '2026-07-25 12:00:00+06:30', '2026-07-26 09:30:00+06:30'),
  ('c1000000-0000-4000-8000-000000000015', 'a1000000-0000-4000-8000-000000000003', 'food', 'b4000000-0000-4000-8000-000000000005', 'completed', 'Monthly food support confirmed and started.', null, null, null, null, null, true, '2026-07-31 08:00:00+06:30', '2026-07-31 07:45:00+06:30', '2026-07-31 08:00:00+06:30', '2026-07-26 10:15:00+06:30', '2026-07-31 08:00:00+06:30'),
  ('c1000000-0000-4000-8000-000000000016', 'a1000000-0000-4000-8000-000000000004', 'food', 'b4000000-0000-4000-8000-000000000007', 'pending', 'Requests halal meal support near Tamwe route.', null, null, null, null, null, true, null, null, null, '2026-08-02 13:00:00+06:30', '2026-08-02 13:00:00+06:30'),
  ('c1000000-0000-4000-8000-000000000017', 'a1000000-0000-4000-8000-000000000005', 'food', 'b4000000-0000-4000-8000-000000000006', 'completed', 'Lunch and dinner subscription completed for the month.', null, null, null, null, null, true, '2026-08-05 18:00:00+06:30', '2026-08-05 17:30:00+06:30', '2026-08-05 18:00:00+06:30', '2026-08-03 09:30:00+06:30', '2026-08-05 18:00:00+06:30'),
  ('c1000000-0000-4000-8000-000000000018', 'a1000000-0000-4000-8000-000000000006', 'food', 'b4000000-0000-4000-8000-000000000002', 'cancelled', 'Full-day plan exceeded the student budget.', null, null, null, null, 'Student selected a lower-cost option instead.', false, null, null, null, '2026-08-06 09:15:00+06:30', '2026-08-06 14:25:00+06:30'),

  ('c1000000-0000-4000-8000-000000000019', 'a1000000-0000-4000-8000-000000000007', 'transportation', '11111111-1111-4111-8111-111111111111', 'pending', 'Needs Hledan pickup near the main bus stop.', '11111111-1111-4111-8111-111111111111-stop-2', 'Hledan', '7:15 AM', 'Hledan Center bus stop', null, true, null, null, null, '2026-07-25 07:40:00+06:30', '2026-07-25 07:40:00+06:30'),
  ('c1000000-0000-4000-8000-000000000020', 'a1000000-0000-4000-8000-000000000008', 'transportation', '33333333-3333-4333-8333-333333333333', 'confirmed', 'Requests Tamwe pickup for regular morning commute.', '33333333-3333-4333-8333-333333333333-stop-1', 'Tamwe', '6:45 AM', 'Tamwe Market front gate', null, false, null, null, null, '2026-07-26 07:30:00+06:30', '2026-07-27 08:15:00+06:30'),
  ('c1000000-0000-4000-8000-000000000021', 'a1000000-0000-4000-8000-000000000009', 'transportation', '44444444-4444-4444-8444-444444444444', 'completed', 'Seat confirmed and commute started.', '44444444-4444-4444-8444-444444444444-stop-1', 'Insein', '6:50 AM', 'Insein station entrance', null, true, '2026-08-01 17:30:00+06:30', '2026-08-01 17:10:00+06:30', '2026-08-01 17:30:00+06:30', '2026-07-27 08:00:00+06:30', '2026-08-01 17:30:00+06:30'),
  ('c1000000-0000-4000-8000-000000000022', 'a1000000-0000-4000-8000-000000000010', 'transportation', '88888888-8888-4888-8888-888888888888', 'confirmed', 'Mayangone pickup requested for exam week.', '88888888-8888-4888-8888-888888888888-stop-1', 'Mayangone', '7:05 AM', '8 Mile junction', null, false, null, null, null, '2026-08-02 07:50:00+06:30', '2026-08-02 16:20:00+06:30'),
  ('c1000000-0000-4000-8000-000000000023', 'a1000000-0000-4000-8000-000000000011', 'transportation', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'completed', 'Route request completed after driver and student confirmation.', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb-stop-2', 'North Okkalapa', '6:45 AM', 'North Okkalapa roundabout', null, true, '2026-08-05 17:15:00+06:30', '2026-08-05 17:05:00+06:30', '2026-08-05 17:15:00+06:30', '2026-08-03 07:20:00+06:30', '2026-08-05 17:15:00+06:30'),
  ('c1000000-0000-4000-8000-000000000024', 'a1000000-0000-4000-8000-000000000012', 'transportation', '22222222-2222-4222-8222-222222222222', 'cancelled', 'Pickup point was outside the approved route.', '22222222-2222-4222-8222-222222222222-stop-2', 'North Dagon', '6:50 AM', 'Requested extension beyond route', 'Pickup address is outside the approved stop list.', false, null, null, null, '2026-08-06 07:10:00+06:30', '2026-08-07 08:40:00+06:30')
on conflict (id) do update
set
  profile_id = excluded.profile_id,
  service_type = excluded.service_type,
  service_id = excluded.service_id,
  status = excluded.status,
  note = excluded.note,
  pickup_stop_id = excluded.pickup_stop_id,
  pickup_stop_name = excluded.pickup_stop_name,
  pickup_time = excluded.pickup_time,
  pickup_address = excluded.pickup_address,
  rejection_reason = excluded.rejection_reason,
  seen_by_student = excluded.seen_by_student,
  requester_completed_at = excluded.requester_completed_at,
  owner_completed_at = excluded.owner_completed_at,
  completed_at = excluded.completed_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.admin_audit_events (
  entity_type,
  entity_id,
  event_type,
  actor_profile_id,
  actor_role,
  summary,
  metadata,
  created_at
)
select
  'provider_registration',
  pr.id,
  case when pr.status = 'active' then 'provider_approved' else 'provider_payment_submitted' end,
  case when pr.status = 'active' then 'a0000000-0000-4000-8000-000000000001'::uuid else pr.profile_id end,
  case when pr.status = 'active' then 'admin' else 'provider' end,
  case
    when pr.status = 'active' then 'School admin approved ' || pr.provider_type || ' provider verification for the UIT demo pilot.'
    else 'Provider submitted school verification for ' || pr.provider_type || ' in the UIT demo pilot.'
  end,
  jsonb_build_object(
    'demo_dataset', 'uit-yangon-2026',
    'provider_type', pr.provider_type,
    'status', pr.status
  ),
  case when pr.status = 'active' then '2026-07-16 10:15:00+06:30'::timestamptz else '2026-07-15 11:15:00+06:30'::timestamptz end
from public.provider_registrations pr
where pr.profile_id in (select profile_id from temp_uit_demo_provider_regs);

insert into public.admin_audit_events (
  entity_type,
  entity_id,
  event_type,
  actor_profile_id,
  actor_role,
  summary,
  metadata,
  created_at
)
select
  'request',
  req.id,
  case
    when req.status = 'confirmed' then 'request_confirmed'
    when req.status = 'cancelled' then 'request_cancelled'
    else 'request_completed'
  end,
  null,
  'provider',
  case
    when req.status = 'confirmed' then 'Student request confirmed for ' || req.service_type || ' service in the UIT demo pilot.'
    when req.status = 'cancelled' then 'Student request cancelled for ' || req.service_type || ' service in the UIT demo pilot.'
    else 'Student request completed for ' || req.service_type || ' service in the UIT demo pilot.'
  end,
  jsonb_build_object(
    'demo_dataset', 'uit-yangon-2026',
    'service_type', req.service_type,
    'status', req.status
  ),
  req.updated_at
from public.requests req
where req.id in (
  'c1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000003',
  'c1000000-0000-4000-8000-000000000005',
  'c1000000-0000-4000-8000-000000000006',
  'c1000000-0000-4000-8000-000000000008',
  'c1000000-0000-4000-8000-000000000009',
  'c1000000-0000-4000-8000-000000000010',
  'c1000000-0000-4000-8000-000000000011',
  'c1000000-0000-4000-8000-000000000012',
  'c1000000-0000-4000-8000-000000000014',
  'c1000000-0000-4000-8000-000000000015',
  'c1000000-0000-4000-8000-000000000017',
  'c1000000-0000-4000-8000-000000000018',
  'c1000000-0000-4000-8000-000000000020',
  'c1000000-0000-4000-8000-000000000021',
  'c1000000-0000-4000-8000-000000000022',
  'c1000000-0000-4000-8000-000000000023',
  'c1000000-0000-4000-8000-000000000024'
)
  and not exists (
    select 1
    from public.admin_audit_events existing_event
    where existing_event.entity_type = 'request'
      and existing_event.entity_id = req.id
      and existing_event.event_type = case
        when req.status = 'confirmed' then 'request_confirmed'
        when req.status = 'cancelled' then 'request_cancelled'
        else 'request_completed'
      end
      and existing_event.metadata ->> 'demo_dataset' = 'uit-yangon-2026'
  );
