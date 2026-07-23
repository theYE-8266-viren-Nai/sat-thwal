import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PROVIDER_REGISTRATION_FEES_MMK,
  PROVIDER_TYPE_LABELS,
} from "@/lib/providerRegistration";
import type { Database, ProviderType } from "@/types/database.types";

export interface MonetizationLineItem {
  key: ProviderType;
  label: string;
  count: number;
  feeMmk: number;
  totalMmk: number;
}

export interface MonetizationReport {
  totalMmk: number;
  lineItems: MonetizationLineItem[];
}

const PROVIDER_TYPES: ProviderType[] = [
  "tutor",
  "hostel",
  "transportation",
  "restaurant",
];

export async function getMonetizationReport(
  supabase: SupabaseClient<Database>,
): Promise<MonetizationReport> {
  const { data: payments, error: paymentError } = await supabase
    .from("provider_payment_submissions")
    .select("registration_id, amount_mmk, reviewed_at")
    .eq("status", "paid");

  if (paymentError) throw paymentError;

  const registrationIds = [
    ...new Set((payments ?? []).map((payment) => payment.registration_id)),
  ];
  const registrations = registrationIds.length
    ? await supabase
        .from("provider_registrations")
        .select("id, provider_type")
        .in("id", registrationIds)
    : { data: [], error: null };

  if (registrations.error) throw registrations.error;

  const registrationType = new Map(
    (registrations.data ?? []).map((registration) => [
      registration.id,
      registration.provider_type,
    ]),
  );
  const counts = new Map(PROVIDER_TYPES.map((providerType) => [providerType, 0]));
  const totals = new Map(PROVIDER_TYPES.map((providerType) => [providerType, 0]));

  (payments ?? []).forEach((payment) => {
    const providerType = registrationType.get(payment.registration_id);
    if (!providerType) return;

    counts.set(providerType, (counts.get(providerType) ?? 0) + 1);
    totals.set(
      providerType,
      (totals.get(providerType) ?? 0) + payment.amount_mmk,
    );
  });

  const lineItems = PROVIDER_TYPES.map((providerType) => ({
    key: providerType,
    label: `${PROVIDER_TYPE_LABELS[providerType]} registrations`,
    count: counts.get(providerType) ?? 0,
    feeMmk: PROVIDER_REGISTRATION_FEES_MMK[providerType],
    totalMmk: totals.get(providerType) ?? 0,
  }));

  return {
    totalMmk: lineItems.reduce((sum, item) => sum + item.totalMmk, 0),
    lineItems,
  };
}
