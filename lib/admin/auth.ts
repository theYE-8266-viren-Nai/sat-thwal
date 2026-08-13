import { redirect } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { getServerAuthContext } from "@/lib/auth/server";

export async function requireAdminProfile() {
  const { supabase, userId, profile } = await getServerAuthContext();
  if (!userId) redirect("/login");
  if (!profile || profile.role !== "admin") {
    redirect(getRoleLandingPath(profile?.role));
  }

  return { supabase, userId, profile };
}
