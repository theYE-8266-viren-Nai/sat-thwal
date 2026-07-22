import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";
import type { ServiceDetailData } from "@/types/detail";
import { formatDistance, formatMMK } from "@/lib/utils";

export type HostelRow = Database["public"]["Tables"]["hostels"]["Row"];

export async function getHostels(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("hostels")
    .select("*")
    .order("distance_km", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getHostelById(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase.from("hostels").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getHostelsByIds(supabase: SupabaseClient<Database>, ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("hostels").select("*").in("id", ids);
  if (error) throw error;
  return data ?? [];
}

const GENDER_LABEL: Record<HostelRow["gender_policy"], string> = {
  male: "Male only",
  female: "Female only",
  mixed: "Mixed",
};

export function hostelToCard(hostel: HostelRow): ServiceCardData {
  return {
    id: hostel.id,
    category: "hostel",
    image: hostel.image_url,
    title: hostel.name,
    subtitle: `${hostel.room_type} · ${GENDER_LABEL[hostel.gender_policy]}`,
    priceLabel: `${formatMMK(hostel.monthly_rent)} / month`,
    verified: hostel.verified,
    meta: [
      { icon: "map-pin", label: `${hostel.township} · ${formatDistance(hostel.distance_km)}` },
      { icon: "users", label: `${hostel.available_rooms} rooms available` },
      ...(hostel.meals_included ? [{ icon: "utensils" as const, label: "Meals included" }] : []),
    ],
    ctaLabel: "View Details",
    href: `/services/hostel/${hostel.id}`,
  };
}

export function hostelToDetail(hostel: HostelRow): ServiceDetailData {
  return {
    id: hostel.id,
    category: "hostel",
    image: hostel.image_url,
    title: hostel.name,
    providerName: hostel.name,
    providerAvatar: null,
    verified: hostel.verified,
    priceLabel: `${formatMMK(hostel.monthly_rent)} / month`,
    availabilityLines: [
      `${hostel.available_rooms} room${hostel.available_rooms === 1 ? "" : "s"} available`,
      `${GENDER_LABEL[hostel.gender_policy]} · ${hostel.room_type}`,
    ],
    locationLabel: `${hostel.township}, ${formatDistance(hostel.distance_km)} from ${hostel.university}`,
    description:
      hostel.description ?? `${hostel.name} is a ${GENDER_LABEL[hostel.gender_policy].toLowerCase()} hostel in ${hostel.township}.`,
    amenities: hostel.meals_included ? [...hostel.facilities, "Meals included"] : hostel.facilities,
    ctaLabel: "Request Room",
    contactInfo: "Message via Sat Thwal to get this hostel owner's contact details.",
  };
}
