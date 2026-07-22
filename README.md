# Sat Thwal (ဆက်သွယ် Myanmar)

All-in-one student life platform for Myanmar university students — tutors, hostels, food, and
transportation in one place. This is a prototype: SmartMatch AI is simulated (naive keyword
matching over mock data), not a real LLM integration.

## Stack

Next.js (App Router, TypeScript) · Tailwind CSS · shadcn/ui · Supabase (Auth + Postgres)

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a Supabase project at [supabase.com](https://supabase.com).
3. Copy `.env.example` to `.env.local` and fill in your project's URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. In the Supabase SQL editor, run the migrations in `supabase/migrations/` **in order**
   (`0001_schema.sql` → `0002_rls.sql` → `0003_seed.sql` → `0004_handle_new_user.sql`).
5. In Supabase Auth settings, disable "Confirm email" for a frictionless prototype signup flow
   (otherwise new users must confirm their email before onboarding).
6. Run the dev server:
   ```
   npm run dev
   ```

## What's implemented

- Email/password auth, onboarding (academic year, township, budget, subjects) writing
  to a `profiles` table.
- Home dashboard, Explore, four service listings (Tutors, Hostels, Food, University Ferry) with
  filters, a shared service detail page, Save + booking/request confirmation flows, and a
  Saved & Requests page with status tabs.
- SmartMatch AI page: simulated recommendations (loading state → one pick per category) based on
  naive keyword/budget/township matching — a placeholder for real matching logic later.
- Student Profile page displaying and editing everything collected during onboarding.
