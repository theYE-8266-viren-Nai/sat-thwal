-- 0024 added student_id_verified defaulting to false for every row,
-- which retroactively locked out accounts that had already completed
-- onboarding before this feature existed. Grandfather those in so only
-- newly signed-up students go through the verification gate.

update profiles
set student_id_verified = true
where onboarding_completed = true
  and student_id_verified = false;
