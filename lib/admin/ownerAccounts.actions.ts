"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { toErrorMessage } from "@/lib/supabase/errors";

export type AdminResetResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendRestaurantOwnerReset(email: string): Promise<AdminResetResult> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { ok: false, error: "Missing account email." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
  if (error) return { ok: false, error: toErrorMessage(error) };

  return { ok: true };
}