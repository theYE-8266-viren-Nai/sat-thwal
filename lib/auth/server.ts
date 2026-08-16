import { cache } from "react";
import { getProfile } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";

export const getServerAuthContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const candidateUserId = session?.user?.id ?? null;

  // The session payload only selects the row. PostgREST verifies the JWT and
  // the profiles RLS policy requires auth.uid() = id before we trust it.
  const profile = candidateUserId ? await getProfile(supabase, candidateUserId) : null;
  const userId = profile?.id ?? null;

  return {
    supabase,
    userId,
    profile,
  };
});
