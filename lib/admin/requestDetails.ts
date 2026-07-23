import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RequestStatus, ServiceType } from "@/types/database.types";
import { normalizeRequestStatus } from "@/lib/queries/requests";

export interface AdminRequestDetail {
  id: string;
  serviceType: ServiceType;
  serviceLabel: string;
  serviceName: string;
  providerName: string | null;
  requesterName: string;
  requesterPhone: string | null;
  status: RequestStatus;
  note: string | null;
  requestedAt: string;
  acceptedAt: string | null;
  requesterCompletedAt: string | null;
  ownerCompletedAt: string | null;
  completedAt: string | null;
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  tutor: "Tutor",
  hostel: "Hostel",
  food: "Food",
  transportation: "Transportation",
};

const RECENT_REQUEST_LIMIT = 80;

export async function getAdminRequestDetails(
  supabase: SupabaseClient<Database>,
): Promise<AdminRequestDetail[]> {
  const { data: requests, error } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(RECENT_REQUEST_LIMIT);
  if (error) throw error;

  const requestRows = (requests ?? []).map(normalizeRequestStatus);
  if (requestRows.length === 0) return [];

  const profileIds = [...new Set(requestRows.map((request) => request.profile_id))];
  const idsByService = {
    tutor: idsForService(requestRows, "tutor"),
    hostel: idsForService(requestRows, "hostel"),
    food: idsForService(requestRows, "food"),
    transportation: idsForService(requestRows, "transportation"),
  };

  const [
    profiles,
    tutors,
    hostels,
    foodPackages,
    routes,
  ] = await Promise.all([
    getProfilesForRequests(supabase, profileIds),
    getTutorsForRequests(supabase, idsByService.tutor),
    getHostelsForRequests(supabase, idsByService.hostel),
    getFoodPackagesForRequests(supabase, idsByService.food),
    getRoutesForRequests(supabase, idsByService.transportation),
  ]);

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const tutorsById = new Map(tutors.map((item) => [item.id, item]));
  const hostelsById = new Map(hostels.map((item) => [item.id, item]));
  const foodPackagesById = new Map(foodPackages.map((item) => [item.id, item]));
  const routesById = new Map(routes.map((item) => [item.id, item]));

  return requestRows.map((request) => {
    const profile = profilesById.get(request.profile_id);
    const serviceInfo = getServiceInfo(request.service_type, request.service_id, {
      tutorsById,
      hostelsById,
      foodPackagesById,
      routesById,
    });

    return {
      id: request.id,
      serviceType: request.service_type,
      serviceLabel: SERVICE_LABELS[request.service_type],
      serviceName: serviceInfo.name,
      providerName: serviceInfo.providerName,
      requesterName: profile?.full_name ?? "A student",
      requesterPhone: profile?.phone ?? null,
      status: request.status,
      note: request.note,
      requestedAt: request.created_at,
      acceptedAt: request.status === "confirmed" || request.status === "completed"
        ? request.updated_at
        : null,
      requesterCompletedAt: request.requester_completed_at,
      ownerCompletedAt: request.owner_completed_at,
      completedAt: request.completed_at,
    };
  });
}

function idsForService(
  requests: Array<Database["public"]["Tables"]["requests"]["Row"]>,
  serviceType: ServiceType,
) {
  return [
    ...new Set(
      requests
        .filter((request) => request.service_type === serviceType)
        .map((request) => request.service_id),
    ),
  ];
}

type FoodPackageLookupRow = {
  id: string;
  name: string;
  restaurant: { name: string } | null;
};

async function getProfilesForRequests(
  supabase: SupabaseClient<Database>,
  ids: string[],
) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", ids);
  if (error) throw error;
  return data ?? [];
}

async function getTutorsForRequests(
  supabase: SupabaseClient<Database>,
  ids: string[],
) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("tutors")
    .select("id, name")
    .in("id", ids);
  if (error) throw error;
  return data ?? [];
}

async function getHostelsForRequests(
  supabase: SupabaseClient<Database>,
  ids: string[],
) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("hostels")
    .select("id, name")
    .in("id", ids);
  if (error) throw error;
  return data ?? [];
}

async function getFoodPackagesForRequests(
  supabase: SupabaseClient<Database>,
  ids: string[],
) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("food_packages")
    .select("id, name, restaurant:restaurants(name)")
    .in("id", ids);
  if (error) throw error;
  return (data ?? []) as unknown as FoodPackageLookupRow[];
}

async function getRoutesForRequests(
  supabase: SupabaseClient<Database>,
  ids: string[],
) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("transportation_routes")
    .select("id, route_name, driver_name")
    .in("id", ids);
  if (error) throw error;
  return data ?? [];
}

function getServiceInfo(
  serviceType: ServiceType,
  serviceId: string,
  lookups: {
    tutorsById: Map<string, { id: string; name: string }>;
    hostelsById: Map<string, { id: string; name: string }>;
    foodPackagesById: Map<string, FoodPackageLookupRow>;
    routesById: Map<string, { id: string; route_name: string; driver_name: string }>;
  },
) {
  if (serviceType === "tutor") {
    const tutor = lookups.tutorsById.get(serviceId);
    return { name: tutor?.name ?? "Tutor listing", providerName: tutor?.name ?? null };
  }

  if (serviceType === "hostel") {
    const hostel = lookups.hostelsById.get(serviceId);
    return { name: hostel?.name ?? "Hostel listing", providerName: hostel?.name ?? null };
  }

  if (serviceType === "food") {
    const foodPackage = lookups.foodPackagesById.get(serviceId);
    return {
      name: foodPackage?.name ?? "Food package",
      providerName: foodPackage?.restaurant?.name ?? null,
    };
  }

  const route = lookups.routesById.get(serviceId);
  return {
    name: route?.route_name ?? "Transportation route",
    providerName: route?.driver_name ?? null,
  };
}
