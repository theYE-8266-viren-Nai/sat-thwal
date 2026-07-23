-- Replace old platform tutor/hostel seed rows with consistent UIT-only catalog data.
--
-- This intentionally touches only platform-managed rows where owner_profile_id
-- is null. User-created tutor applications and hostel listings are preserved.

delete from public.requests
where service_type = 'tutor'
  and service_id in (
    select id
    from public.tutors
    where owner_profile_id is null
  );

delete from public.saved_items
where service_type = 'tutor'
  and service_id in (
    select id
    from public.tutors
    where owner_profile_id is null
  );

delete from public.requests
where service_type = 'hostel'
  and service_id in (
    select id
    from public.hostels
    where owner_profile_id is null
  );

delete from public.saved_items
where service_type = 'hostel'
  and service_id in (
    select id
    from public.hostels
    where owner_profile_id is null
  );

delete from public.tutors
where owner_profile_id is null;

delete from public.hostels
where owner_profile_id is null;

insert into public.tutors (
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
  owner_profile_id
) values
  (
    'Aung Kyaw Zin',
    'https://i.pravatar.cc/150?img=12',
    array['Programming Fundamentals', 'C++', 'Python'],
    'Hlaing',
    'UIT senior student who helps first-year students build strong programming foundations through practical exercises.',
    4.8,
    42,
    8000,
    'both',
    'Weekday evenings and Saturday mornings',
    true,
    null
  ),
  (
    'Thura Aung',
    'https://i.pravatar.cc/150?img=51',
    array['Data Structures', 'Algorithms', 'Competitive Programming'],
    'Insein',
    'Competitive programmer focused on algorithmic thinking, exam preparation, and coding interview practice.',
    4.9,
    57,
    10000,
    'online',
    'Evenings after 6 PM',
    true,
    null
  ),
  (
    'Kaung Myat Thu',
    'https://i.pravatar.cc/150?img=60',
    array['Web Development', 'JavaScript', 'React'],
    'Hledan',
    'Full-stack project tutor for students who want to connect coursework with real web app development.',
    4.7,
    33,
    8500,
    'both',
    'Flexible scheduling',
    true,
    null
  ),
  (
    'Phyo Pyae Sone',
    'https://i.pravatar.cc/150?img=8',
    array['Operating Systems', 'Linux', 'Systems Programming'],
    'Hlaing',
    'Systems-focused tutor who explains OS concepts with diagrams, terminal demos, and weekly practice tasks.',
    4.8,
    44,
    9500,
    'in_person',
    'Tuesday, Thursday, and Saturday',
    true,
    null
  ),
  (
    'Moe Moe Zaw',
    'https://i.pravatar.cc/150?img=36',
    array['Statistics', 'Probability', 'Data Analysis'],
    'North Okkalapa',
    'Patient statistics tutor for UIT students who need help with probability, assignments, and exam revision.',
    4.6,
    28,
    7500,
    'online',
    'Weekday mornings',
    true,
    null
  ),
  (
    'Nandar Htet',
    'https://i.pravatar.cc/150?img=49',
    array['Database Systems', 'SQL', 'ERD Design'],
    'Kamayut',
    'Database tutor specializing in SQL practice, normalization, ER diagrams, and project schema review.',
    4.7,
    31,
    9000,
    'both',
    'Monday, Wednesday, and Sunday',
    true,
    null
  ),
  (
    'Ye Min Oo',
    'https://i.pravatar.cc/150?img=53',
    array['Computer Networks', 'Cybersecurity Basics'],
    'Mayangone',
    'Network fundamentals tutor who uses simple labs to explain protocols, subnetting, and security basics.',
    4.5,
    24,
    8500,
    'online',
    'Friday evenings and weekends',
    true,
    null
  ),
  (
    'Su Pyae Mon',
    'https://i.pravatar.cc/150?img=44',
    array['Academic English', 'Presentation Skills', 'Technical Writing'],
    'Sanchaung',
    'Academic English tutor for UIT students preparing reports, presentations, and internship interviews.',
    4.8,
    39,
    7000,
    'both',
    'Weekend afternoons',
    true,
    null
  );

insert into public.hostels (
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
  owner_profile_id
) values
  (
    'UIT Hlaing Residence',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
    'Hlaing',
    0.5,
    150000,
    'male',
    'Shared (2-bed)',
    array['Wi-Fi', 'Laundry', 'Study Room', 'CCTV'],
    4,
    true,
    'Male hostel near UIT main gate with study spaces, laundry access, and breakfast plus dinner included.',
    true,
    null
  ),
  (
    'Hledan Golden Girls Hostel',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
    'Hledan',
    1.1,
    135000,
    'female',
    'Shared (4-bed)',
    array['Wi-Fi', 'Security Guard', 'Study Room', 'Water Purifier'],
    6,
    false,
    'Female-only hostel around Hledan with easy bus access to UIT and a quiet study-friendly setup.',
    true,
    null
  ),
  (
    'Kamayut Student House',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
    'Kamayut',
    1.8,
    145000,
    'mixed',
    'Shared (2-bed)',
    array['Wi-Fi', 'Kitchen Access', 'Hot Water', 'Common Room'],
    5,
    false,
    'Mixed student house for UIT students who want a balance of privacy, shared kitchen access, and commute options.',
    true,
    null
  ),
  (
    'Insein Budget Stay',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600',
    'Insein',
    3.2,
    100000,
    'male',
    'Shared (4-bed)',
    array['Wi-Fi', 'Parking', 'Common Room'],
    8,
    false,
    'Affordable male hostel in Insein for students who prefer a lower monthly rent and direct transport to UIT.',
    true,
    null
  ),
  (
    'Mayangone Comfort Hostel',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
    'Mayangone',
    2.6,
    125000,
    'female',
    'Shared (3-bed)',
    array['Wi-Fi', 'Laundry', 'Security Guard', 'Backup Power'],
    5,
    true,
    'Female hostel with simple meal support, backup power, and a calm environment for regular study routines.',
    true,
    null
  ),
  (
    'North Okkalapa Green House',
    'https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=600',
    'North Okkalapa',
    4.0,
    95000,
    'mixed',
    'Shared (4-bed)',
    array['Wi-Fi', 'Garden', 'Kitchen Access', 'Security Guard'],
    7,
    true,
    'Budget-friendly hostel with home-style meals and garden space, best for students who want lower costs.',
    true,
    null
  ),
  (
    'Sanchaung Study Inn',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600',
    'Sanchaung',
    3.5,
    140000,
    'female',
    'Single',
    array['Wi-Fi', 'Air Conditioning', 'Hot Water', 'CCTV'],
    2,
    false,
    'Small female hostel with single rooms, good for students who need quiet space for exam preparation.',
    true,
    null
  ),
  (
    'Hledan Central Suites',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600',
    'Hledan',
    0.9,
    165000,
    'mixed',
    'Single',
    array['Wi-Fi', 'Air Conditioning', 'Hot Water', 'CCTV', 'Study Room'],
    3,
    false,
    'Premium single-room option near Hledan junction with quick access to food, buses, and UIT routes.',
    true,
    null
  );
