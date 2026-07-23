import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSupabaseAdminConfig } from "./env";

export function createAdminClient() {
  const { url, key } = getSupabaseAdminConfig();
  return createSupabaseClient<Database>(url, key);
}