import type { SupabaseClient } from "@supabase/supabase-js";
import { getFoodItemsByIds, foodToCard } from "@/lib/queries/food";
import { getHostelByOwner, getHostelsByIds, hostelToCard } from "@/lib/queries/hostels";
import { getProfile, getProfilesByIds } from "@/lib/queries/profiles";
import { getRequests, normalizeRequestStatus } from "@/lib/queries/requests";
import { getRoutesByIds, routeToCard } from "@/lib/queries/transportation";
import { getTutorByOwner, getTutorsByIds, tutorToCard } from "@/lib/queries/tutors";
import type { Database } from "@/types/database.types";
import type { ServiceCardData, ServiceCategory } from "@/types/domain";

export type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

export interface SavedRequestItem {
  request: RequestRow;
  card: ServiceCardData;
}

export interface IncomingRequestItem {
  request: RequestRow;
  requesterName: string;
}

export interface IncomingRequestScope {
  serviceType: ServiceCategory;
  serviceIds: string[];
}

export interface OwnedServices {
  tutorId: string | null;
  hostelId: string | null;
}

export async function getCurrentProfileId(supabase: SupabaseClient<Database>) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getCurrentProfile(supabase: SupabaseClient<Database>) {
  const profileId = await getCurrentProfileId(supabase);
  return profileId ? getProfile(supabase, profileId) : null;
}

export async function getOwnedServices(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<OwnedServices> {
  const [tutor, hostel] = await Promise.all([
    getTutorByOwner(supabase, profileId),
    getHostelByOwner(supabase, profileId),
  ]);

  return { tutorId: tutor?.id ?? null, hostelId: hostel?.id ?? null };
}

export async function getSavedRequestItems(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<SavedRequestItem[]> {
  const requestRows = await getRequests(supabase, profileId);

  const idsByCategory: Record<ServiceCategory, Set<string>> = {
    tutor: new Set(),
    hostel: new Set(),
    food: new Set(),
    transportation: new Set(),
  };

  requestRows.forEach((request) => idsByCategory[request.service_type].add(request.service_id));

  const [tutors, hostels, foodItems, routes] = await Promise.all([
    getTutorsByIds(supabase, [...idsByCategory.tutor]),
    getHostelsByIds(supabase, [...idsByCategory.hostel]),
    getFoodItemsByIds(supabase, [...idsByCategory.food]),
    getRoutesByIds(supabase, [...idsByCategory.transportation]),
  ]);

  const cardMap = new Map<string, ServiceCardData>();
  tutors.forEach((tutor) => cardMap.set(`tutor:${tutor.id}`, tutorToCard(tutor)));
  hostels.forEach((hostel) => cardMap.set(`hostel:${hostel.id}`, hostelToCard(hostel)));
  foodItems.forEach((food) => cardMap.set(`food:${food.package.id}`, foodToCard(food)));
  routes.forEach((route) => cardMap.set(`transportation:${route.id}`, routeToCard(route)));

  return requestRows
    .map((request) => {
      const card = cardMap.get(`${request.service_type}:${request.service_id}`);
      return card ? { request, card } : null;
    })
    .filter((item): item is SavedRequestItem => Boolean(item));
}

export async function getIncomingRequestItems(
  supabase: SupabaseClient<Database>,
  scope: IncomingRequestScope,
): Promise<IncomingRequestItem[]> {
  if (scope.serviceIds.length === 0) return [];

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("service_type", scope.serviceType)
    .in("service_id", scope.serviceIds)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const requests = (data ?? []).map(normalizeRequestStatus);
  const requesters = await getProfilesByIds(supabase, [
    ...new Set(requests.map((request) => request.profile_id)),
  ]);
  const requesterMap = new Map(requesters.map((profile) => [profile.id, profile.full_name ?? "A student"]));

  return requests.map((request) => ({
    request,
    requesterName: requesterMap.get(request.profile_id) ?? "A student",
  }));
}

export function createOptimisticRequest({
  profileId,
  category,
  serviceId,
  note,
}: {
  profileId: string;
  category: ServiceCategory;
  serviceId: string;
  note?: string;
}): RequestRow {
  const now = new Date().toISOString();

  return {
    id: `optimistic-${category}-${serviceId}-${Date.now()}`,
    profile_id: profileId,
    service_type: category,
    service_id: serviceId,
    status: "pending",
    note: note ?? null,
    pickup_stop_id: null,
    pickup_stop_name: null,
    pickup_time: null,
    pickup_address: null,
    rejection_reason: null,
    seen_by_student: true,
    requester_completed_at: null,
    owner_completed_at: null,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };
}
