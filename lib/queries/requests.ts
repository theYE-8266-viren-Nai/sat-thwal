import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RequestStatus } from "@/types/database.types";
import type { ServiceCategory } from "@/types/domain";

export async function getRequests(supabase: SupabaseClient<Database>, profileId: string) {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createRequest(
  supabase: SupabaseClient<Database>,
  profileId: string,
  category: ServiceCategory,
  serviceId: string,
  note?: string,
) {
  const { data, error } = await supabase
    .from("requests")
    .insert({ profile_id: profileId, service_type: category, service_id: serviceId, note })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateRequestStatus(
  supabase: SupabaseClient<Database>,
  requestId: string,
  status: RequestStatus,
) {
  const { error } = await supabase
    .from("requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw error;
}
