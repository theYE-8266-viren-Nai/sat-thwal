-- Replace old tutor seed rows with fictional individual tutor accounts.
-- Each seeded tutor has an image, a matching auth user/profile, and an active
-- tutor provider registration.
--
-- Demo password for every account below: SatThwalTutor123!

create temporary table temp_demo_tutors (
  profile_id uuid primary key,
  full_name text not null,
  email text not null,
  avatar_url text not null,
  primary_subject text not null,
  subjects text[] not null,
  academic_year text not null,
  township text not null,
  bio text not null,
  rating numeric(2,1) not null,
  review_count integer not null,
  price_per_session integer not null,
  session_mode text not null,
  availability_note text not null
) on commit drop;

insert into temp_demo_tutors (
  profile_id,
  full_name,
  email,
  avatar_url,
  primary_subject,
  subjects,
  academic_year,
  township,
  bio,
  rating,
  review_count,
  price_per_session,
  session_mode,
  availability_note
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'Aung Kyaw Zin',
    'aung.kyaw.zin.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=12',
    'Programming Fundamentals',
    array['Programming Fundamentals', 'Python', 'C++'],
    'Final year',
    'Hlaing',
    'Final-year UIT student who helps first-year students build strong programming foundations through practical exercises.',
    4.8,
    42,
    8000,
    'both',
    'Weekday evenings and Saturday mornings'
  ),
  (
    '12121212-1212-4121-8121-121212121212',
    'Htet Wai Lin',
    'htet.wai.lin.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=11',
    'Programming Fundamentals',
    array['Programming Fundamentals', 'C++', 'Problem Solving'],
    'Third year',
    'Kamayut',
    'Patient programming tutor for students who want extra practice with loops, arrays, functions, and debugging basics.',
    4.7,
    35,
    7500,
    'in_person',
    'Monday, Wednesday, and Friday evenings'
  ),
  (
    '13131313-1313-4131-8131-131313131313',
    'May Thazin Oo',
    'may.thazin.oo.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=5',
    'Programming Fundamentals',
    array['Programming Fundamentals', 'Python', 'Assignment Review'],
    'Final year',
    'Sanchaung',
    'Supportive tutor focused on beginner-friendly Python lessons, code walkthroughs, and assignment review.',
    4.9,
    48,
    8500,
    'online',
    'Weekday nights after 7 PM'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Thura Aung',
    'thura.aung.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=51',
    'Data Structures',
    array['Data Structures', 'Algorithms', 'Competitive Programming'],
    'Final year',
    'Insein',
    'Competitive programmer focused on algorithmic thinking, exam preparation, and coding interview practice.',
    4.9,
    57,
    10000,
    'online',
    'Evenings after 6 PM'
  ),
  (
    '23232323-2323-4232-8232-232323232323',
    'Pyae Sone Htun',
    'pyae.sone.htun.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=13',
    'Data Structures',
    array['Data Structures', 'Algorithms', 'Exam Revision'],
    'Final year',
    'Hledan',
    'Data structures tutor who explains linked lists, trees, graphs, and sorting with small visual examples.',
    4.8,
    46,
    9500,
    'both',
    'Tuesday, Thursday, and Sunday'
  ),
  (
    '24242424-2424-4242-8242-242424242424',
    'Ei Phyo Wai',
    'ei.phyo.wai.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=25',
    'Data Structures',
    array['Data Structures', 'C++', 'Problem Solving'],
    'Third year',
    'Mayangone',
    'Practice-first tutor for students preparing for data structures quizzes and lab tests.',
    4.6,
    29,
    8500,
    'online',
    'Saturday and Sunday mornings'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Kaung Myat Thu',
    'kaung.myat.thu.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=60',
    'Web Development',
    array['Web Development', 'JavaScript', 'React'],
    'Third year',
    'Hledan',
    'Full-stack project tutor for students who want to connect coursework with real web app development.',
    4.7,
    33,
    8500,
    'both',
    'Flexible scheduling'
  ),
  (
    '34343434-3434-4343-8343-343434343434',
    'Yadanar Win',
    'yadanar.win.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=47',
    'Web Development',
    array['Web Development', 'HTML', 'CSS', 'JavaScript'],
    'Final year',
    'North Okkalapa',
    'Frontend tutor who helps students turn class projects into clean responsive pages.',
    4.8,
    41,
    8000,
    'online',
    'Weekday afternoons'
  ),
  (
    '35353535-3535-4353-8353-353535353535',
    'Nay Lin Htet',
    'nay.lin.htet.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=17',
    'Web Development',
    array['Web Development', 'React', 'Next.js'],
    'Final year',
    'Hlaing',
    'Project-based web tutor for React components, routing, forms, and Supabase-backed assignments.',
    4.9,
    52,
    10500,
    'both',
    'Friday evenings and weekends'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Nandar Htet',
    'nandar.htet.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=49',
    'Database Systems',
    array['Database Systems', 'SQL', 'ERD Design'],
    'Final year',
    'Kamayut',
    'Database tutor specializing in SQL practice, normalization, ER diagrams, and project schema review.',
    4.7,
    31,
    9000,
    'both',
    'Monday, Wednesday, and Sunday'
  ),
  (
    '45454545-4545-4454-8454-454545454545',
    'Min Khant Paing',
    'min.khant.paing.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=18',
    'Database Systems',
    array['Database Systems', 'SQL', 'Normalization'],
    'Third year',
    'Insein',
    'SQL tutor for students who need help writing queries, joins, grouped reports, and schema exercises.',
    4.6,
    27,
    8000,
    'online',
    'Tuesday and Thursday evenings'
  ),
  (
    '46464646-4646-4464-8464-464646464646',
    'Hnin Ei Mon',
    'hnin.ei.mon.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=32',
    'Database Systems',
    array['Database Systems', 'ERD Design', 'Project Schema Review'],
    'Final year',
    'Sanchaung',
    'Database design tutor who reviews ER diagrams, normalization decisions, and final-project schemas.',
    4.8,
    38,
    9500,
    'both',
    'Weekend afternoons'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'Moe Moe Zaw',
    'moe.moe.zaw.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=36',
    'Statistics',
    array['Statistics', 'Probability', 'Data Analysis'],
    'Third year',
    'North Okkalapa',
    'Patient statistics tutor for UIT students who need help with probability, assignments, and exam revision.',
    4.6,
    28,
    7500,
    'online',
    'Weekday mornings'
  ),
  (
    '56565656-5656-4565-8565-565656565656',
    'Thet Mon Aye',
    'thet.mon.aye.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=26',
    'Statistics',
    array['Statistics', 'Probability', 'Exam Revision'],
    'Final year',
    'Mayangone',
    'Statistics tutor who breaks down formulas, distributions, and exam-style probability questions.',
    4.7,
    34,
    8000,
    'both',
    'Wednesday evenings and Sundays'
  ),
  (
    '57575757-5757-4575-8575-575757575757',
    'Zin Mar Hlaing',
    'zin.mar.hlaing.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=29',
    'Statistics',
    array['Statistics', 'Data Analysis', 'Spreadsheet Practice'],
    'Third year',
    'Hledan',
    'Applied statistics tutor for students who want examples, assignment walkthroughs, and data analysis practice.',
    4.8,
    40,
    8500,
    'online',
    'Monday and Friday mornings'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Ye Min Oo',
    'ye.min.oo.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=53',
    'Computer Networks',
    array['Computer Networks', 'Cybersecurity Basics'],
    'Final year',
    'Mayangone',
    'Network fundamentals tutor who uses simple labs to explain protocols, subnetting, and security basics.',
    4.5,
    24,
    8500,
    'online',
    'Friday evenings and weekends'
  ),
  (
    '67676767-6767-4676-8676-676767676767',
    'Ko Htet Naing',
    'htet.naing.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=54',
    'Computer Networks',
    array['Computer Networks', 'Subnetting', 'Network Labs'],
    'Final year',
    'Hlaing',
    'Networking tutor who helps students practice subnetting, routing basics, and packet-flow diagrams.',
    4.7,
    32,
    9000,
    'in_person',
    'Saturday afternoons'
  ),
  (
    '68686868-6868-4686-8686-686868686868',
    'Soe Htet Aung',
    'soe.htet.aung.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=59',
    'Computer Networks',
    array['Computer Networks', 'Cybersecurity Basics', 'Protocols'],
    'Third year',
    'Kamayut',
    'Concept-focused tutor for network layers, common protocols, and introductory security topics.',
    4.6,
    26,
    8000,
    'both',
    'Tuesday nights and Sunday mornings'
  ),
  (
    '71717171-7171-4717-8717-717171717171',
    'Phyo Pyae Sone',
    'phyo.pyae.sone.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=8',
    'Operating Systems',
    array['Operating Systems', 'Linux', 'Systems Programming'],
    'Final year',
    'Hlaing',
    'Systems-focused tutor who explains OS concepts with diagrams, terminal demos, and weekly practice tasks.',
    4.8,
    44,
    9500,
    'in_person',
    'Tuesday, Thursday, and Saturday'
  ),
  (
    '72727272-7272-4727-8727-727272727272',
    'Wai Yan Tun',
    'wai.yan.tun.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=15',
    'Operating Systems',
    array['Operating Systems', 'Process Scheduling', 'Memory Management'],
    'Third year',
    'Kamayut',
    'OS tutor for students who want clear walkthroughs of scheduling, deadlocks, memory, and file systems.',
    4.7,
    36,
    8500,
    'online',
    'Monday and Thursday nights'
  ),
  (
    '73737373-7373-4737-8737-737373737373',
    'Khin Hnin Wai',
    'khin.hnin.wai.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=35',
    'Operating Systems',
    array['Operating Systems', 'Linux', 'Terminal Practice'],
    'Final year',
    'Mayangone',
    'Practical Linux and operating systems tutor for students who learn best with command-line demos.',
    4.8,
    39,
    9000,
    'both',
    'Weekend mornings'
  ),
  (
    '81818181-8181-4818-8818-818181818181',
    'Sithu Hein',
    'sithu.hein.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=33',
    'Software Engineering',
    array['Software Engineering', 'UML', 'Project Planning'],
    'Final year',
    'Hledan',
    'Software engineering tutor for UML diagrams, requirements, sprint planning, and final project documentation.',
    4.7,
    30,
    8500,
    'both',
    'Wednesday evenings and Saturdays'
  ),
  (
    '82828282-8282-4828-8828-828282828282',
    'Mya Hnin Thwe',
    'mya.hnin.thwe.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=41',
    'Software Engineering',
    array['Software Engineering', 'Testing', 'Documentation'],
    'Third year',
    'Sanchaung',
    'Tutor for software testing basics, documentation quality, and practical project review sessions.',
    4.6,
    25,
    8000,
    'online',
    'Tuesday and Friday evenings'
  ),
  (
    '83838383-8383-4838-8838-838383838383',
    'Zaw Htet Paing',
    'zaw.htet.paing.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=52',
    'AI and Machine Learning',
    array['AI and Machine Learning', 'Python', 'Model Evaluation'],
    'Final year',
    'North Okkalapa',
    'Intro AI tutor who helps students understand datasets, simple models, metrics, and Python notebooks.',
    4.8,
    43,
    11000,
    'online',
    'Friday nights and Sunday afternoons'
  ),
  (
    '84848484-8484-4848-8848-848484848484',
    'Nyein Chan Aye',
    'nyein.chan.aye.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=20',
    'AI and Machine Learning',
    array['AI and Machine Learning', 'Data Preprocessing', 'Classification'],
    'Final year',
    'Insein',
    'Machine learning tutor focused on beginner-friendly classification projects and clean experiment notes.',
    4.9,
    49,
    11500,
    'both',
    'Saturday and Sunday evenings'
  ),
  (
    '85858585-8585-4858-8858-858585858585',
    'Ei Mon Khant',
    'ei.mon.khant.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=31',
    'Mobile Development',
    array['Mobile Development', 'Flutter', 'Firebase'],
    'Third year',
    'Hlaing',
    'Mobile app tutor for Flutter layouts, navigation, forms, and small student project builds.',
    4.7,
    37,
    9500,
    'both',
    'Monday evenings and weekends'
  ),
  (
    '86868686-8686-4868-8868-868686868686',
    'Kyaw Swar Lin',
    'kyaw.swar.lin.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=57',
    'Mobile Development',
    array['Mobile Development', 'Android Basics', 'API Integration'],
    'Final year',
    'Mayangone',
    'Tutor for mobile fundamentals, API calls, local state, and debugging project issues.',
    4.6,
    28,
    9000,
    'online',
    'Thursday nights and Sunday mornings'
  ),
  (
    '87878787-8787-4878-8878-878787878787',
    'Thandar Soe',
    'thandar.soe.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=48',
    'UI/UX Design',
    array['UI/UX Design', 'Figma', 'Design Systems'],
    'Third year',
    'Kamayut',
    'Design tutor for wireframes, Figma components, usability review, and polished project presentation screens.',
    4.8,
    34,
    8500,
    'online',
    'Weekday afternoons'
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'Nay Chi Lwin',
    'nay.chi.lwin.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=45',
    'Academic English',
    array['Academic English', 'Presentation Skills', 'Technical Writing'],
    'Final year',
    'Sanchaung',
    'Academic English tutor for reports, slide scripts, internship introductions, and confident presentations.',
    4.7,
    32,
    7500,
    'both',
    'Weekend afternoons'
  ),
  (
    '89898989-8989-4898-8898-898989898989',
    'Hla Hla Myint',
    'hla.hla.myint.tutor@sat-thwal.local',
    'https://i.pravatar.cc/150?img=46',
    'Academic English',
    array['Academic English', 'Report Writing', 'Interview Practice'],
    'Third year',
    'Hledan',
    'Writing and speaking tutor for students preparing technical reports and internship interviews.',
    4.6,
    27,
    7000,
    'online',
    'Tuesday mornings and Saturday afternoons'
  );

delete from public.requests
where service_type = 'tutor'
  and service_id in (
    select id
    from public.tutors
    where photo_url is null
       or owner_profile_id is null
       or owner_profile_id in (select profile_id from temp_demo_tutors)
  );

delete from public.saved_items
where service_type = 'tutor'
  and service_id in (
    select id
    from public.tutors
    where photo_url is null
       or owner_profile_id is null
       or owner_profile_id in (select profile_id from temp_demo_tutors)
  );

delete from public.tutors
where photo_url is null
   or owner_profile_id is null
   or owner_profile_id in (select profile_id from temp_demo_tutors);

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
  crypt('SatThwalTutor123!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('full_name', full_name),
  now(),
  now()
from temp_demo_tutors
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
  jsonb_build_object('sub', profile_id::text, 'email', email),
  'email',
  now(),
  now(),
  now()
from temp_demo_tutors
on conflict (provider_id, provider) do update
set
  identity_data = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = now();

insert into public.profiles (
  id,
  full_name,
  avatar_url,
  academic_year,
  township,
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
  academic_year,
  township,
  subjects,
  'en',
  true,
  true,
  true,
  now(),
  'student'
from temp_demo_tutors
on conflict (id) do update
set
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  academic_year = excluded.academic_year,
  township = excluded.township,
  preferred_subjects = excluded.preferred_subjects,
  language_preference = excluded.language_preference,
  notification_opt_in = excluded.notification_opt_in,
  onboarding_completed = excluded.onboarding_completed,
  student_id_verified = excluded.student_id_verified,
  student_id_verified_at = coalesce(public.profiles.student_id_verified_at, excluded.student_id_verified_at),
  role = excluded.role,
  updated_at = now();

insert into public.provider_registrations (
  profile_id,
  provider_type,
  fee_amount_mmk,
  status,
  activated_at
)
select
  profile_id,
  'tutor',
  round(price_per_session * 0.15)::integer,
  'active',
  now()
from temp_demo_tutors
on conflict (profile_id, provider_type) do update
set
  fee_amount_mmk = excluded.fee_amount_mmk,
  status = excluded.status,
  activated_at = coalesce(public.provider_registrations.activated_at, excluded.activated_at),
  updated_at = now();

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
)
select
  full_name,
  avatar_url,
  subjects,
  township,
  bio,
  rating,
  review_count,
  price_per_session,
  session_mode,
  availability_note,
  true,
  profile_id
from temp_demo_tutors;
