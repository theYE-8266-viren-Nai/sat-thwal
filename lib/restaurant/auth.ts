import { redirect } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type RestaurantProfile = Database["public"]["Tables"]["profiles"]["Row"];

export async function requireRestaurantProfile() {
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
  if (!profile || profile.role !== "restaurant") {
    redirect(getRoleLandingPath(profile?.role));
  }

  return { supabase, user, profile };
}
