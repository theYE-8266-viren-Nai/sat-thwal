"use server";

import { createClient } from "@/lib/supabase/server";
import { getTutorByOwner, insertTutorProfile, updateTutorProfile } from "@/lib/queries/tutors";
import { parseGradesCsv } from "@/lib/tutorEligibility";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { getProviderRegistration } from "@/lib/queries/providerRegistrations";
import { isProviderPaymentMethod } from "@/lib/providerRegistration";
import { toErrorMessage } from "@/lib/supabase/errors";
import type { ProviderPaymentMethod } from "@/types/database.types";

export interface ApplyAsTutorInput {
  csvText: string;
  name: string;
  photoUrl: string;
  subjects: string[];
  township: string;
  bio: string;
  pricePerSession: string;
  sessionMode: "online" | "in_person" | "both";
  availabilityNote: string;
  paymentMethod: ProviderPaymentMethod;
  transactionReference: string;
}

export type ApplyAsTutorResult =
  | { ok: true; tutorId: string }
  | { ok: false; error: string; tutorId?: string };

export async function applyAsTutor(input: ApplyAsTutorInput): Promise<ApplyAsTutorResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired — please log in again." };

  const existing = await getTutorByOwner(supabase, user.id);
  if (existing) return { ok: false, error: "already-a-tutor" };

  const gradesCheck = parseGradesCsv(input.csvText);
  if (!gradesCheck.ok) return { ok: false, error: gradesCheck.error ?? "Could not read the grades file." };
  if (!gradesCheck.eligible) return { ok: false, error: gradesCheck.reason ?? "You don't meet the grade requirement yet." };

  const name = input.name.trim();
  const township = input.township.trim();
  const price = Number.parseInt(input.pricePerSession, 10);

  if (!name) return { ok: false, error: "Name is required." };
  if (input.subjects.length === 0) return { ok: false, error: "Select at least one subject you can teach." };
  if (!TOWNSHIPS.includes(township as (typeof TOWNSHIPS)[number])) {
    return { ok: false, error: "Select a valid township." };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, error: "Price per session must be a positive number." };
  }
  if (!["online", "in_person", "both"].includes(input.sessionMode)) {
    return { ok: false, error: "Select a valid session mode." };
  }
  if (!isProviderPaymentMethod(input.paymentMethod)) {
    return { ok: false, error: "Select a valid payment method." };
  }
  if (!input.transactionReference.trim()) {
    return { ok: false, error: "Enter the payment transaction reference." };
  }

  let createdTutorId: string | undefined;
  try {
    const created = await insertTutorProfile(supabase, {
      name,
      photo_url: input.photoUrl.trim() || null,
      subjects: input.subjects,
      township,
      bio: input.bio.trim() || null,
      price_per_session: price,
      session_mode: input.sessionMode,
      availability_note: input.availabilityNote.trim() || null,
      owner_profile_id: user.id,
    });
    createdTutorId = created.id;

    const registration = await getProviderRegistration(supabase, user.id, "tutor");
    if (!registration) throw new Error("The tutor payment registration was not created.");

    const { error: paymentError } = await supabase.rpc(
      "submit_provider_registration_payment",
      {
        p_registration_id: registration.id,
        p_payment_method: input.paymentMethod,
        p_transaction_reference: input.transactionReference.trim(),
      },
    );
    if (paymentError) throw paymentError;

    return { ok: true, tutorId: created.id };
  } catch (error) {
    return {
      ok: false,
      error: createdTutorId
        ? `Your tutor profile was saved, but the payment reference needs to be submitted again. ${toErrorMessage(error)}`
        : "Couldn't save your tutor profile. Try again.",
      tutorId: createdTutorId,
    };
  }
}

export interface EditTutorProfileInput {
  name: string;
  photoUrl: string;
  subjects: string[];
  township: string;
  bio: string;
  pricePerSession: string;
  sessionMode: "online" | "in_person" | "both";
  availabilityNote: string;
}

export type EditTutorProfileResult = { ok: true; tutorId: string } | { ok: false; error: string };

export async function editTutorProfile(input: EditTutorProfileInput): Promise<EditTutorProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired — please log in again." };

  const existing = await getTutorByOwner(supabase, user.id);
  if (!existing) return { ok: false, error: "You don't have a tutor profile yet." };

  const name = input.name.trim();
  const township = input.township.trim();
  const price = Number.parseInt(input.pricePerSession, 10);

  if (!name) return { ok: false, error: "Name is required." };
  if (input.subjects.length === 0) return { ok: false, error: "Select at least one subject you can teach." };
  if (!TOWNSHIPS.includes(township as (typeof TOWNSHIPS)[number])) {
    return { ok: false, error: "Select a valid township." };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, error: "Price per session must be a positive number." };
  }
  if (!["online", "in_person", "both"].includes(input.sessionMode)) {
    return { ok: false, error: "Select a valid session mode." };
  }

  try {
    const updated = await updateTutorProfile(supabase, existing.id, {
      name,
      photo_url: input.photoUrl.trim() || null,
      subjects: input.subjects,
      township,
      bio: input.bio.trim() || null,
      price_per_session: price,
      session_mode: input.sessionMode,
      availability_note: input.availabilityNote.trim() || null,
    });
    return { ok: true, tutorId: updated.id };
  } catch {
    return { ok: false, error: "Couldn't save your changes. Try again." };
  }
}
