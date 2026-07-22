import { redirect } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminProfile() {
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
  if (!profile || profile.role !== "admin") {
    redirect(getRoleLandingPath(profile?.role));
  }

  return { supabase, user, profile };
}
