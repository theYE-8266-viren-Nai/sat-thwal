import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SessionMode } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";
import type { ServiceDetailData } from "@/types/detail";
import { formatMMK } from "@/lib/utils";

export type TutorRow = Database["public"]["Tables"]["tutors"]["Row"];

export async function getTutors(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("tutors")
    .select("*")
    .order("rating", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTutorById(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase.from("tutors").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getTutorsByIds(supabase: SupabaseClient<Database>, ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("tutors").select("*").in("id", ids);
  if (error) throw error;
  return data ?? [];
}

export async function getTutorByOwner(supabase: SupabaseClient<Database>, profileId: string) {
  const { data, error } = await supabase
    .from("tutors")
    .select("*")
    .eq("owner_profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface TutorApplicationPayload {
  name: string;
  photo_url: string | null;
  subjects: string[];
  township: string;
  bio: string | null;
  price_per_session: number;
  session_mode: SessionMode;
  availability_note: string | null;
  owner_profile_id: string;
}

export async function insertTutorProfile(
  supabase: SupabaseClient<Database>,
  payload: TutorApplicationPayload,
) {
  const { data, error } = await supabase
    .from("tutors")
    .insert({
      ...payload,
      verified: false,
      rating: 0,
      review_count: 0,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateTutorProfile(
  supabase: SupabaseClient<Database>,
  tutorId: string,
  updates: Database["public"]["Tables"]["tutors"]["Update"],
) {
  const { data, error } = await supabase
    .from("tutors")
    .update(updates)
    .eq("id", tutorId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export function tutorToCard(tutor: TutorRow): ServiceCardData {
  const modeLabel =
    tutor.session_mode === "both"
      ? "Online or in-person"
      : tutor.session_mode === "online"
        ? "Online"
        : "In-person";

  return {
    id: tutor.id,
    category: "tutor",
    image: tutor.photo_url,
    title: tutor.name,
    subtitle: tutor.subjects.join(", "),
    priceLabel: `${formatMMK(tutor.price_per_session)} / session`,
    rating: tutor.rating,
    reviewCount: tutor.review_count,
    verified: tutor.verified,
    meta: [
      { icon: "map-pin", label: tutor.township },
      { icon: "clock", label: modeLabel },
    ],
    ctaLabel: "Book Session",
    href: `/services/tutor/${tutor.id}`,
  };
}

export function tutorToDetail(tutor: TutorRow): ServiceDetailData {
  const modeLabel =
    tutor.session_mode === "both"
      ? "Online or in-person"
      : tutor.session_mode === "online"
        ? "Online only"
        : "In-person only";

  return {
    id: tutor.id,
    category: "tutor",
    image: tutor.photo_url,
    title: tutor.name,
    providerName: tutor.name,
    providerAvatar: tutor.photo_url,
    verified: tutor.verified,
    rating: tutor.rating,
    reviewCount: tutor.review_count,
    priceLabel: `${formatMMK(tutor.price_per_session)} / session`,
    availabilityLines: [tutor.availability_note ?? "Contact tutor for availability", modeLabel],
    locationLabel: tutor.township,
    description: tutor.bio ?? `${tutor.name} tutors ${tutor.subjects.join(", ")}.`,
    amenities: tutor.subjects,
    ctaLabel: "Request Session",
    contactInfo: "Message via Sat Thwal to get this tutor's contact details.",
    ownerProfileId: tutor.owner_profile_id,
  };
}
