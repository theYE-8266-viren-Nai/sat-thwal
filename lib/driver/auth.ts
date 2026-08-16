import { redirect } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { getServerAuthContext } from "@/lib/auth/server";
import { throwSupabaseError } from "@/lib/supabase/errors";
import type { Database } from "@/types/database.types";

export type DriverProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type DriverProviderProfile = Database["public"]["Tables"]["driver_profiles"]["Row"];

export async function requireDriverProfile() {
  const { supabase, userId, profile } = await getServerAuthContext();
  if (!userId) redirect("/login");
  if (!profile || profile.role !== "driver") {
    redirect(getRoleLandingPath(profile?.role));
  }

  const { data: driverProfile, error: driverProfileError } = await supabase
    .from("driver_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (driverProfileError) throwSupabaseError(driverProfileError, "Could not load driver profile.");
  if (!driverProfile) {
    redirect("/login");
  }

  return { supabase, userId, profile, driverProfile };
}
