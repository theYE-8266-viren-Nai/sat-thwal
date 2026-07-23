-- Grandfather currently owned restaurants into active provider access.
--
-- Restaurant owners are manually linked in v1 and restaurant revenue is shown as
-- an admin estimate, not collected through the provider payment flow. If an
-- owned restaurant was linked after the provider-registration migration, its
-- registration can remain pending_payment and block student food subscriptions.
-- This keeps existing owned restaurants usable without counting them as paid
-- revenue.

insert into public.provider_registrations (
  profile_id,
  provider_type,
  fee_amount_mmk,
  status,
  activated_at
)
select
  r.owner_profile_id,
  'restaurant',
  pfs.amount_mmk,
  'active',
  now()
from public.restaurants as r
join public.provider_fee_schedule as pfs
  on pfs.provider_type = 'restaurant'
where r.owner_profile_id is not null
on conflict (profile_id, provider_type) do update
set
  status = 'active',
  activated_at = coalesce(public.provider_registrations.activated_at, now()),
  updated_at = now();

insert into public.provider_payment_submissions (
  registration_id,
  amount_mmk,
  payment_method,
  transaction_reference,
  status,
  reviewed_at
)
select
  pr.id,
  pr.fee_amount_mmk,
  'other',
  'restaurant-grandfathering',
  'waived',
  now()
from public.provider_registrations as pr
where pr.provider_type = 'restaurant'
  and pr.status = 'active'
  and not exists (
    select *
    from public.provider_payment_submissions as pps
    where pps.registration_id = pr.id
      and pps.status in ('paid', 'waived')
  );

update public.restaurants
set verified = true
where owner_profile_id is not null
  and private.provider_registration_is_active(owner_profile_id, 'restaurant');
