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
  commissionCount: number;
  commissionLabel: string;
  commissionMmk: number;
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

const TRANSPORTATION_COMMISSION_RATE = 0.15;
const FOOD_COMMISSION_RATE = 0.15;

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

  const { data: transportationRequests, error: transportationError } = await supabase
    .from("requests")
    .select("service_id")
    .eq("service_type", "transportation")
    .in("status", ["confirmed", "completed"]);
  if (transportationError) throw transportationError;

  const routeIds = [
    ...new Set((transportationRequests ?? []).map((request) => request.service_id)),
  ];
  const routes = routeIds.length
    ? await supabase
        .from("transportation_routes")
        .select("id, monthly_price")
        .in("id", routeIds)
    : { data: [], error: null };
  if (routes.error) throw routes.error;

  const routePrice = new Map(
    (routes.data ?? []).map((route) => [route.id, route.monthly_price]),
  );
  const transportationCommissionMmk = (transportationRequests ?? []).reduce(
    (sum, request) => {
      const monthlyPrice = routePrice.get(request.service_id) ?? 0;
      return sum + Math.round(monthlyPrice * TRANSPORTATION_COMMISSION_RATE);
    },
    0,
  );

  const { data: foodRequests, error: foodError } = await supabase
    .from("requests")
    .select("service_id")
    .eq("service_type", "food")
    .in("status", ["confirmed", "completed"]);
  if (foodError) throw foodError;

  const foodPackageIds = [
    ...new Set((foodRequests ?? []).map((request) => request.service_id)),
  ];
  const foodPackages = foodPackageIds.length
    ? await supabase
        .from("food_packages")
        .select("id, monthly_price")
        .in("id", foodPackageIds)
    : { data: [], error: null };
  if (foodPackages.error) throw foodPackages.error;

  const foodPackagePrice = new Map(
    (foodPackages.data ?? []).map((foodPackage) => [
      foodPackage.id,
      foodPackage.monthly_price,
    ]),
  );
  const foodCommissionMmk = (foodRequests ?? []).reduce((sum, request) => {
    const monthlyPrice = foodPackagePrice.get(request.service_id) ?? 0;
    return sum + Math.round(monthlyPrice * FOOD_COMMISSION_RATE);
  }, 0);

  const lineItems = PROVIDER_TYPES.map((providerType) => ({
    key: providerType,
    label: `${PROVIDER_TYPE_LABELS[providerType]} registrations`,
    count: counts.get(providerType) ?? 0,
    feeMmk: PROVIDER_REGISTRATION_FEES_MMK[providerType],
    commissionCount:
      providerType === "transportation"
        ? (transportationRequests ?? []).length
        : providerType === "restaurant"
          ? (foodRequests ?? []).length
          : 0,
    commissionLabel:
      providerType === "transportation"
        ? "accepted seat"
        : providerType === "restaurant"
          ? "food subscription"
          : "commission",
    commissionMmk:
      providerType === "transportation"
        ? transportationCommissionMmk
        : providerType === "restaurant"
          ? foodCommissionMmk
          : 0,
    totalMmk:
      (totals.get(providerType) ?? 0) +
      (providerType === "transportation"
        ? transportationCommissionMmk
        : providerType === "restaurant"
          ? foodCommissionMmk
          : 0),
  }));

  return {
    totalMmk: lineItems.reduce((sum, item) => sum + item.totalMmk, 0),
    lineItems,
  };
}
