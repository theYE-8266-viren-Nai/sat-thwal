import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ServiceType } from "@/types/database.types";

export type AdminServiceOverviewKey = Extract<
  ServiceType,
  "tutor" | "hostel" | "food" | "transportation"
>;

export interface AdminServiceOverviewItem {
  key: AdminServiceOverviewKey;
  label: string;
  totalCount: number;
  activeRequestCount: number;
  description: string;
}

const SERVICE_OVERVIEW_META: Record<
  AdminServiceOverviewKey,
  Pick<AdminServiceOverviewItem, "label" | "description">
> = {
  tutor: {
    label: "Tutors",
    description: "Tutor listings and active session requests.",
  },
  hostel: {
    label: "Hostels",
    description: "Room listings and active room requests.",
  },
  food: {
    label: "Food packages",
    description: "Enabled monthly packages and active subscriptions.",
  },
  transportation: {
    label: "Transportation",
    description: "Routes and active seat requests.",
  },
};

export async function getAdminServiceOverview(
  supabase: SupabaseClient<Database>,
): Promise<AdminServiceOverviewItem[]> {
  const [
    tutorsResult,
    hostelsResult,
    foodPackagesResult,
    routesResult,
    activeRequestsResult,
  ] = await Promise.all([
    supabase.from("tutors").select("id", { count: "exact", head: true }),
    supabase.from("hostels").select("id", { count: "exact", head: true }),
    supabase
      .from("food_packages")
      .select("id", { count: "exact", head: true })
      .eq("is_enabled", true),
    supabase
      .from("transportation_routes")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("requests")
      .select("service_type")
      .in("service_type", ["tutor", "hostel", "food", "transportation"])
      .in("status", ["pending", "confirmed"]),
  ]);

  if (tutorsResult.error) throw tutorsResult.error;
  if (hostelsResult.error) throw hostelsResult.error;
  if (foodPackagesResult.error) throw foodPackagesResult.error;
  if (routesResult.error) throw routesResult.error;
  if (activeRequestsResult.error) throw activeRequestsResult.error;

  const activeCounts = new Map<AdminServiceOverviewKey, number>([
    ["tutor", 0],
    ["hostel", 0],
    ["food", 0],
    ["transportation", 0],
  ]);

  (activeRequestsResult.data ?? []).forEach((request) => {
    if (!isServiceOverviewKey(request.service_type)) return;
    activeCounts.set(
      request.service_type,
      (activeCounts.get(request.service_type) ?? 0) + 1,
    );
  });

  return [
    {
      key: "tutor",
      totalCount: tutorsResult.count ?? 0,
      activeRequestCount: activeCounts.get("tutor") ?? 0,
      ...SERVICE_OVERVIEW_META.tutor,
    },
    {
      key: "hostel",
      totalCount: hostelsResult.count ?? 0,
      activeRequestCount: activeCounts.get("hostel") ?? 0,
      ...SERVICE_OVERVIEW_META.hostel,
    },
    {
      key: "food",
      totalCount: foodPackagesResult.count ?? 0,
      activeRequestCount: activeCounts.get("food") ?? 0,
      ...SERVICE_OVERVIEW_META.food,
    },
    {
      key: "transportation",
      totalCount: routesResult.count ?? 0,
      activeRequestCount: activeCounts.get("transportation") ?? 0,
      ...SERVICE_OVERVIEW_META.transportation,
    },
  ];
}

function isServiceOverviewKey(value: ServiceType): value is AdminServiceOverviewKey {
  return (
    value === "tutor" ||
    value === "hostel" ||
    value === "food" ||
    value === "transportation"
  );
}
