import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  ProviderRegistrationStatus,
  ProviderType,
  RequestStatus,
  ServiceType,
} from "@/types/database.types";

export type SchoolReportingCategoryKey = Extract<
  ServiceType,
  "tutor" | "hostel" | "food" | "transportation"
>;

export interface SchoolReportingCategoryDemand {
  key: SchoolReportingCategoryKey;
  label: string;
  requestCount: number;
  activeRequestCount: number;
  approvedProviderCount: number;
  pendingApprovalCount: number;
  sharePercent: number;
}

export interface SchoolReportingMetrics {
  activeRequestCount: number;
  approvedProviderCount: number;
  pendingApprovalCount: number;
  demandByCategory: SchoolReportingCategoryDemand[];
}

const CATEGORY_META: Record<SchoolReportingCategoryKey, { label: string }> = {
  tutor: { label: "Tutors" },
  hostel: { label: "Hostels" },
  food: { label: "Food packages" },
  transportation: { label: "Transportation" },
};

const CATEGORY_KEYS: SchoolReportingCategoryKey[] = [
  "tutor",
  "hostel",
  "food",
  "transportation",
];

const ACTIVE_REQUEST_STATUSES: RequestStatus[] = ["pending", "confirmed"];
const APPROVED_PROVIDER_STATUS: ProviderRegistrationStatus = "active";
const PENDING_APPROVAL_STATUS: ProviderRegistrationStatus = "payment_review";

export async function getSchoolReportingMetrics(
  supabase: SupabaseClient<Database>,
): Promise<SchoolReportingMetrics> {
  const [requestsResult, registrationsResult] = await Promise.all([
    supabase
      .from("requests")
      .select("service_type, status")
      .in("service_type", CATEGORY_KEYS),
    supabase
      .from("provider_registrations")
      .select("provider_type, status")
      .in("provider_type", ["tutor", "hostel", "restaurant", "transportation"]),
  ]);

  if (requestsResult.error) throw requestsResult.error;
  if (registrationsResult.error) throw registrationsResult.error;

  const requestCounts = createCategoryCountMap();
  const activeRequestCounts = createCategoryCountMap();
  const approvedProviderCounts = createCategoryCountMap();
  const pendingApprovalCounts = createCategoryCountMap();

  (requestsResult.data ?? []).forEach((request) => {
    if (!isCategoryKey(request.service_type)) return;

    increment(requestCounts, request.service_type);
    if (ACTIVE_REQUEST_STATUSES.includes(request.status)) {
      increment(activeRequestCounts, request.service_type);
    }
  });

  (registrationsResult.data ?? []).forEach((registration) => {
    const categoryKey = providerTypeToCategoryKey(registration.provider_type);
    if (!categoryKey) return;

    if (registration.status === APPROVED_PROVIDER_STATUS) {
      increment(approvedProviderCounts, categoryKey);
    }
    if (registration.status === PENDING_APPROVAL_STATUS) {
      increment(pendingApprovalCounts, categoryKey);
    }
  });

  const totalRequestCount = sumCounts(requestCounts);
  const demandByCategory = CATEGORY_KEYS.map((key) => {
    const requestCount = requestCounts.get(key) ?? 0;

    return {
      key,
      label: CATEGORY_META[key].label,
      requestCount,
      activeRequestCount: activeRequestCounts.get(key) ?? 0,
      approvedProviderCount: approvedProviderCounts.get(key) ?? 0,
      pendingApprovalCount: pendingApprovalCounts.get(key) ?? 0,
      sharePercent:
        totalRequestCount === 0
          ? 0
          : Math.round((requestCount / totalRequestCount) * 100),
    };
  });

  return {
    activeRequestCount: sumCounts(activeRequestCounts),
    approvedProviderCount: sumCounts(approvedProviderCounts),
    pendingApprovalCount: sumCounts(pendingApprovalCounts),
    demandByCategory,
  };
}

function createCategoryCountMap() {
  return new Map<SchoolReportingCategoryKey, number>(
    CATEGORY_KEYS.map((key) => [key, 0]),
  );
}

function increment(
  counts: Map<SchoolReportingCategoryKey, number>,
  key: SchoolReportingCategoryKey,
) {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function sumCounts(counts: Map<SchoolReportingCategoryKey, number>) {
  return [...counts.values()].reduce((sum, count) => sum + count, 0);
}

function providerTypeToCategoryKey(
  providerType: ProviderType,
): SchoolReportingCategoryKey | null {
  if (providerType === "restaurant") return "food";
  if (isCategoryKey(providerType)) return providerType;
  return null;
}

function isCategoryKey(value: ServiceType | ProviderType): value is SchoolReportingCategoryKey {
  return CATEGORY_KEYS.includes(value as SchoolReportingCategoryKey);
}
