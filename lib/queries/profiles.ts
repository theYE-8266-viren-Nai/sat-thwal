import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { StudentProfile } from "@/types/domain";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfile(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfilesByIds(supabase: SupabaseClient<Database>, ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("profiles").select("*").in("id", ids);
  if (error) throw error;
  return data ?? [];
}

export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: Database["public"]["Tables"]["profiles"]["Update"],
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export function profileToStudentProfile(row: ProfileRow): StudentProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    academicYear: row.academic_year,
    township: row.township,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    preferredSubjects: row.preferred_subjects,
    languagePreference: row.language_preference,
    notificationOptIn: row.notification_opt_in,
    onboardingCompleted: row.onboarding_completed,
  };
}
