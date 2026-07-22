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
  const isResponse = status === "confirmed" || status === "cancelled";
  const { error } = await supabase
    .from("requests")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(isResponse ? { seen_by_student: false } : {}),
    })
    .eq("id", requestId);
  if (error) throw error;
}

export async function markRequestCompletedByRequester(
  supabase: SupabaseClient<Database>,
  requestId: string,
) {
  const { data, error } = await supabase.rpc("mark_request_completed_by_requester", {
    p_request_id: requestId,
  });
  if (error) throw error;
  return data;
}

export async function markRequestCompletedByOwner(
  supabase: SupabaseClient<Database>,
  requestId: string,
) {
  const { data, error } = await supabase.rpc("mark_request_completed_by_owner", {
    p_request_id: requestId,
  });
  if (error) throw error;
  return data;
}

export async function getRequestsForTutor(supabase: SupabaseClient<Database>, tutorId: string) {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("service_type", "tutor")
    .eq("service_id", tutorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getRequestsForHostel(supabase: SupabaseClient<Database>, hostelId: string) {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("service_type", "hostel")
    .eq("service_id", hostelId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getUnseenResponses(supabase: SupabaseClient<Database>, profileId: string) {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("profile_id", profileId)
    .eq("seen_by_student", false)
    .in("status", ["confirmed", "cancelled"])
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markResponsesSeen(supabase: SupabaseClient<Database>) {
  const { error } = await supabase.rpc("mark_request_responses_seen");
  if (error) throw error;
}
