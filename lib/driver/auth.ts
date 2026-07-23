import { redirect } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { throwSupabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type DriverProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type DriverProviderProfile = Database["public"]["Tables"]["driver_profiles"]["Row"];

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

  if (error) throwSupabaseError(error, "Could not load profile.");
  if (!profile || profile.role !== "driver") {
    redirect(getRoleLandingPath(profile?.role));
  }

  const { data: driverProfile, error: driverProfileError } = await supabase
    .from("driver_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (driverProfileError) throwSupabaseError(driverProfileError, "Could not load driver profile.");
  if (!driverProfile) {
    redirect("/login");
  }

  return { supabase, user, profile, driverProfile };
}
