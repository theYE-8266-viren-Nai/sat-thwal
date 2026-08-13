import { redirect } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { getServerAuthContext } from "@/lib/auth/server";
import type { Database } from "@/types/database.types";

export type RestaurantProfile = Database["public"]["Tables"]["profiles"]["Row"];

export async function requireRestaurantProfile() {
  const { supabase, userId, profile } = await getServerAuthContext();
  if (!userId) redirect("/login");
  if (!profile || profile.role !== "restaurant") {
    redirect(getRoleLandingPath(profile?.role));
  }

  return { supabase, userId, profile };
}
