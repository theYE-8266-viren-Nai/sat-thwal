import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ServiceCategory } from "@/types/domain";

export async function getSavedItems(supabase: SupabaseClient<Database>, profileId: string) {
  const { data, error } = await supabase
    .from("saved_items")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function isSaved(
  supabase: SupabaseClient<Database>,
  profileId: string,
  category: ServiceCategory,
  serviceId: string,
) {
  const { data, error } = await supabase
    .from("saved_items")
    .select("id")
    .eq("profile_id", profileId)
    .eq("service_type", category)
    .eq("service_id", serviceId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function saveItem(
  supabase: SupabaseClient<Database>,
  profileId: string,
  category: ServiceCategory,
  serviceId: string,
) {
  const { error } = await supabase
    .from("saved_items")
    .insert({ profile_id: profileId, service_type: category, service_id: serviceId });
  if (error) throw error;
}

export async function unsaveItem(
  supabase: SupabaseClient<Database>,
  profileId: string,
  category: ServiceCategory,
  serviceId: string,
) {
  const { error } = await supabase
    .from("saved_items")
    .delete()
    .eq("profile_id", profileId)
    .eq("service_type", category)
    .eq("service_id", serviceId);
  if (error) throw error;
}
