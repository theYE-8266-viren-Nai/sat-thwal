-- Lets admins inspect request/subscription activity across every service type.

create policy "admins can read all requests" on requests
  for select using (public.is_admin_user(auth.uid()));

create policy "admins can read all profiles" on profiles
  for select using (public.is_admin_user(auth.uid()));

create policy "admins can read all food packages" on food_packages
  for select using (public.is_admin_user(auth.uid()));
