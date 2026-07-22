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

export async function getHostelByOwner(supabase: SupabaseClient<Database>, profileId: string) {
  const { data, error } = await supabase
    .from("hostels")
    .select("*")
    .eq("owner_profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface HostelListingPayload {
  name: string;
  image_url: string | null;
  university: string;
  township: string;
  distance_km: number;
  monthly_rent: number;
  gender_policy: HostelRow["gender_policy"];
  room_type: string;
  facilities: string[];
  available_rooms: number;
  meals_included: boolean;
  description: string | null;
  owner_profile_id: string;
}

export async function insertHostelListing(
  supabase: SupabaseClient<Database>,
  payload: HostelListingPayload,
) {
  const { data, error } = await supabase
    .from("hostels")
    .insert({ ...payload, verified: false })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateHostelListing(
  supabase: SupabaseClient<Database>,
  hostelId: string,
  updates: Database["public"]["Tables"]["hostels"]["Update"],
) {
  const { data, error } = await supabase
    .from("hostels")
    .update(updates)
    .eq("id", hostelId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
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
    ownerProfileId: hostel.owner_profile_id,
  };
}
