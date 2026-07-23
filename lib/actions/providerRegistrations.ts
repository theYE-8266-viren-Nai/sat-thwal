"use server";

import { revalidatePath } from "next/cache";
import { requireAdminProfile } from "@/lib/admin/auth";
import { isProviderPaymentMethod } from "@/lib/providerRegistration";
import { createClient } from "@/lib/supabase/server";
import { toErrorMessage } from "@/lib/supabase/errors";

export type ProviderPaymentActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitProviderRegistrationPayment(input: {
  registrationId: string;
  paymentMethod: string;
}): Promise<ProviderPaymentActionResult> {
  if (!isProviderPaymentMethod(input.paymentMethod)) {
    return { ok: false, error: "Select a valid payment method." };
  }

  const transactionReference = `AUTO-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`.toUpperCase();

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_provider_registration_payment", {
    p_registration_id: input.registrationId,
    p_payment_method: input.paymentMethod,
    p_transaction_reference: transactionReference,
  });

  if (error) return { ok: false, error: toErrorMessage(error) };

  revalidatePath("/tutors/apply");
  revalidatePath("/hostels/list");
  revalidatePath("/driver/dashboard");
  revalidatePath("/restaurant/dashboard");
  return { ok: true };
}

export async function reviewProviderRegistrationPayment(input: {
  paymentId: string;
  approve: boolean;
  rejectionReason?: string;
}): Promise<ProviderPaymentActionResult> {
  const { supabase } = await requireAdminProfile();
  const { error } = await supabase.rpc("review_provider_registration_payment", {
    p_payment_id: input.paymentId,
    p_approve: input.approve,
    p_rejection_reason: input.rejectionReason?.trim() || null,
  });

  if (error) return { ok: false, error: toErrorMessage(error) };

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/provider-registrations");
  revalidatePath("/tutors");
  revalidatePath("/hostels");
  revalidatePath("/food");
  revalidatePath("/transportation");
  revalidatePath("/driver/dashboard");
  revalidatePath("/restaurant/dashboard");
  return { ok: true };
}
