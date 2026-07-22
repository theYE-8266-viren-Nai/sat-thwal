import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ServiceType } from "@/types/database.types";

export const MONETIZATION_FEES_MMK = {
  tutor: 2_000,
  hostel: 5_000,
  transportation: 3_000,
  restaurantListing: 20_000,
} as const;

type CommissionService = Extract<ServiceType, "tutor" | "hostel" | "transportation">;

export interface MonetizationLineItem {
  key: CommissionService | "restaurantListing";
  label: string;
  count: number;
  feeMmk: number;
  totalMmk: number;
}

export interface MonetizationReport {
  totalMmk: number;
  lineItems: MonetizationLineItem[];
}

const COMMISSION_SERVICES: Array<{
  key: CommissionService;
  label: string;
  feeMmk: number;
}> = [
  { key: "tutor", label: "Tutor completed bookings", feeMmk: MONETIZATION_FEES_MMK.tutor },
  { key: "hostel", label: "Hostel completed bookings", feeMmk: MONETIZATION_FEES_MMK.hostel },
  {
    key: "transportation",
    label: "Transportation completed bookings",
    feeMmk: MONETIZATION_FEES_MMK.transportation,
  },
];

export async function getMonetizationReport(
  supabase: SupabaseClient<Database>,
): Promise<MonetizationReport> {
  const [completedRequestsResult, restaurantListingsResult] = await Promise.all([
    supabase
      .from("requests")
      .select("service_type, completed_at, requester_completed_at, owner_completed_at")
      .in("service_type", COMMISSION_SERVICES.map((service) => service.key)),
    supabase
      .from("restaurants")
      .select("id", { count: "exact", head: true })
      .not("owner_profile_id", "is", null),
  ]);

  if (completedRequestsResult.error) throw completedRequestsResult.error;
  if (restaurantListingsResult.error) throw restaurantListingsResult.error;

  const completedCounts = new Map<CommissionService, number>(
    COMMISSION_SERVICES.map((service) => [service.key, 0]),
  );

  (completedRequestsResult.data ?? []).forEach((request) => {
    if (!isCommissionService(request.service_type)) return;
    if (!isCompletedRequest(request)) return;

    completedCounts.set(
      request.service_type,
      (completedCounts.get(request.service_type) ?? 0) + 1,
    );
  });

  const commissionLineItems = COMMISSION_SERVICES.map((service) => {
    const count = completedCounts.get(service.key) ?? 0;
    return {
      key: service.key,
      label: service.label,
      count,
      feeMmk: service.feeMmk,
      totalMmk: count * service.feeMmk,
    };
  });

  const restaurantCount = restaurantListingsResult.count ?? 0;
  const lineItems: MonetizationLineItem[] = [
    ...commissionLineItems,
    {
      key: "restaurantListing",
      label: "Restaurant platform listings",
      count: restaurantCount,
      feeMmk: MONETIZATION_FEES_MMK.restaurantListing,
      totalMmk: restaurantCount * MONETIZATION_FEES_MMK.restaurantListing,
    },
  ];

  return {
    totalMmk: lineItems.reduce((sum, item) => sum + item.totalMmk, 0),
    lineItems,
  };
}

function isCompletedRequest(request: {
  completed_at: string | null;
  requester_completed_at: string | null;
  owner_completed_at: string | null;
}) {
  return Boolean(
    request.completed_at ||
      (request.requester_completed_at && request.owner_completed_at),
  );
}

function isCommissionService(value: ServiceType): value is CommissionService {
  return value === "tutor" || value === "hostel" || value === "transportation";
}
