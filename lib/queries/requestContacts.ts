import type { SupabaseClient } from "@supabase/supabase-js";
import type { AcceptedRequestContactRow, Database } from "@/types/database.types";

export type AcceptedRequestContact = {
  requestId: string;
  serviceType: "tutor" | "hostel";
  requestStatus: "confirmed" | "completed";
  requestNote: string | null;
  requestedAt: string;
  contactProfileId: string;
  contactRole: "student" | "tutor" | "hostel_owner";
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  township: string | null;
  academicYear: string | null;
  preferredSubjects: string[];
  languagePreference: string | null;
};

function normalizeAcceptedRequestContact(row: AcceptedRequestContactRow): AcceptedRequestContact {
  return {
    requestId: row.request_id,
    serviceType: row.service_type,
    requestStatus: row.request_status,
    requestNote: row.request_note,
    requestedAt: row.requested_at,
    contactProfileId: row.contact_profile_id,
    contactRole: row.contact_role,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    township: row.township,
    academicYear: row.academic_year,
    preferredSubjects: row.preferred_subjects ?? [],
    languagePreference: row.language_preference,
  };
}

export async function getAcceptedRequestContact(
  supabase: SupabaseClient<Database>,
  requestId: string,
): Promise<AcceptedRequestContact | null> {
  if (!requestId) return null;

  const { data, error } = await supabase.rpc("get_accepted_request_contact", {
    p_request_id: requestId,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return row ? normalizeAcceptedRequestContact(row as AcceptedRequestContactRow) : null;
}
