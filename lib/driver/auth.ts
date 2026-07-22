import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type DriverProfile = Database["public"]["Tables"]["profiles"]["Row"];

export async function requireDriverProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!profile || (profile.role !== "driver" && profile.role !== "admin")) {
    redirect("/home");
  }

  return { supabase, user, profile };
}
