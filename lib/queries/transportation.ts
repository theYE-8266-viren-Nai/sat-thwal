import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";
import type { ServiceDetailData } from "@/types/detail";
import { formatMMK } from "@/lib/utils";

export type TransportationRow = Database["public"]["Tables"]["transportation_routes"]["Row"];

export async function getRoutes(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("transportation_routes")
    .select("*")
    .order("departure_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getRouteById(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from("transportation_routes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getRoutesByIds(supabase: SupabaseClient<Database>, ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("transportation_routes").select("*").in("id", ids);
  if (error) throw error;
  return data ?? [];
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function routeToCard(route: TransportationRow): ServiceCardData {
  return {
    id: route.id,
    category: "transportation",
    image: null,
    title: route.route_name,
    subtitle: `${route.pickup_township} → ${route.university}`,
    priceLabel: `${formatMMK(route.monthly_price)} / month`,
    verified: route.verified,
    meta: [
      { icon: "clock", label: `Departs ${formatTime(route.departure_time)}` },
      { icon: "clock", label: `Returns ${formatTime(route.return_time)}` },
      { icon: "users", label: `${route.available_seats} seats available` },
    ],
    ctaLabel: "Request Seat",
    href: `/services/transportation/${route.id}`,
  };
}

export function routeToDetail(route: TransportationRow): ServiceDetailData {
  return {
    id: route.id,
    category: "transportation",
    image: null,
    title: route.route_name,
    providerName: route.driver_name,
    providerAvatar: null,
    verified: route.verified,
    priceLabel: `${formatMMK(route.monthly_price)} / month`,
    availabilityLines: [
      `Departs ${formatTime(route.departure_time)} · Returns ${formatTime(route.return_time)}`,
      `${route.available_seats} of ${route.total_seats} seats available`,
    ],
    locationLabel: `${route.pickup_township} → ${route.university}`,
    description: `${route.route_name} run by ${route.driver_name}${
      route.vehicle_type ? ` (${route.vehicle_type})` : ""
    }, picking up students from ${route.pickup_township} for ${route.university}.`,
    amenities: [route.vehicle_type ?? "Shared vehicle", "Verified pickup point"],
    ctaLabel: "Request Seat",
    contactInfo: "Message via Sat Thwal to reserve your seat with this driver.",
  };
}

export { formatTime };
