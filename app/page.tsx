import { redirect } from "next/navigation";
import { getProfile } from "@/lib/queries/profiles";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  redirect(getRoleLandingPath(profile?.role));
}
