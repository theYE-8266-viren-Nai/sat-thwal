-- ဆက်သွယ် Myanmar — core schema

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  university text,
  academic_year text,
  township text,
  budget_min integer,
  budget_max integer,
  preferred_subjects text[] not null default '{}',
  language_preference text not null default 'en',
  notification_opt_in boolean not null default true,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tutors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  subjects text[] not null default '{}',
  university text not null,
  township text not null,
  bio text,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  price_per_session integer not null,
  session_mode text not null default 'both' check (session_mode in ('online', 'in_person', 'both')),
  availability_note text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists hostels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  university text not null,
  township text not null,
  distance_km numeric(4,1) not null,
  monthly_rent integer not null,
  gender_policy text not null check (gender_policy in ('male', 'female', 'mixed')),
  room_type text not null,
  facilities text[] not null default '{}',
  available_rooms integer not null default 0,
  meals_included boolean not null default false,
  description text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  township text not null,
  distance_km numeric(4,1) not null,
  rating numeric(2,1) not null default 0,
  delivery boolean not null default false,
  pickup boolean not null default true,
  vegetarian_options boolean not null default false,
  halal boolean not null default false,
  opening_hours text,
  student_discount_percent integer,
  created_at timestamptz not null default now()
);

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  name text not null,
  price integer not null,
  image_url text,
  is_student_package boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists transportation_routes (
  id uuid primary key default gen_random_uuid(),
  driver_name text not null,
  route_name text not null,
  pickup_township text not null,
  route_stops text[] not null default '{}',
  route_pickup_times text[] not null default '{}',
  university text not null,
  departure_time time not null,
  return_time time not null,
  monthly_price integer not null,
  total_seats integer not null,
  available_seats integer not null,
  vehicle_type text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists saved_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  service_type text not null check (service_type in ('tutor', 'hostel', 'food', 'transportation')),
  service_id uuid not null,
  created_at timestamptz not null default now(),
  unique (profile_id, service_type, service_id)
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  service_type text not null check (service_type in ('tutor', 'hostel', 'food', 'transportation')),
  service_id uuid not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
