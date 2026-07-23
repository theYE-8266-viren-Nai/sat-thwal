import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  ProviderPaymentStatus,
  ProviderType,
} from "@/types/database.types";

export type ProviderRegistration =
  Database["public"]["Tables"]["provider_registrations"]["Row"];
export type ProviderPaymentSubmission =
  Database["public"]["Tables"]["provider_payment_submissions"]["Row"];

export interface ProviderRegistrationReview {
  registration: ProviderRegistration;
  payment: ProviderPaymentSubmission;
  providerName: string;
  providerPhone: string | null;
}

export async function getProviderRegistration(
  supabase: SupabaseClient<Database>,
  profileId: string,
  providerType: ProviderType,
) {
  const { data, error } = await supabase
    .from("provider_registrations")
    .select("*")
    .eq("profile_id", profileId)
    .eq("provider_type", providerType)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getLatestProviderPayment(
  supabase: SupabaseClient<Database>,
  registrationId: string,
) {
  const { data, error } = await supabase
    .from("provider_payment_submissions")
    .select("*")
    .eq("registration_id", registrationId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProviderRegistrationWithPayment(
  supabase: SupabaseClient<Database>,
  profileId: string,
  providerType: ProviderType,
) {
  const registration = await getProviderRegistration(supabase, profileId, providerType);
  const payment = registration
    ? await getLatestProviderPayment(supabase, registration.id)
    : null;

  return { registration, payment };
}

export async function getProviderRegistrationReviews(
  supabase: SupabaseClient<Database>,
): Promise<ProviderRegistrationReview[]> {
  const { data: payments, error: paymentError } = await supabase
    .from("provider_payment_submissions")
    .select("*")
    .eq("status", "submitted" satisfies ProviderPaymentStatus)
    .order("submitted_at", { ascending: true });

  if (paymentError) throw paymentError;
  if (!payments?.length) return [];

  const registrationIds = [...new Set(payments.map((payment) => payment.registration_id))];
  const { data: registrations, error: registrationError } = await supabase
    .from("provider_registrations")
    .select("*")
    .in("id", registrationIds);

  if (registrationError) throw registrationError;
  const registrationMap = new Map(
    (registrations ?? []).map((registration) => [registration.id, registration]),
  );

  const profileIds = [
    ...new Set(
      (registrations ?? []).map((registration) => registration.profile_id),
    ),
  ];
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", profileIds);

  if (profileError) throw profileError;
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return payments.flatMap((payment) => {
    const registration = registrationMap.get(payment.registration_id);
    if (!registration) return [];
    const profile = profileMap.get(registration.profile_id);

    return [{
      registration,
      payment,
      providerName: profile?.full_name ?? "Provider",
      providerPhone: profile?.phone ?? null,
    }];
  });
}

export async function getPendingProviderRegistrationCount(
  supabase: SupabaseClient<Database>,
) {
  const { count, error } = await supabase
    .from("provider_payment_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "submitted" satisfies ProviderPaymentStatus);

  if (error) throw error;
  return count ?? 0;
}
