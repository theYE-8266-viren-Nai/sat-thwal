"use server";

import { createClient } from "@/lib/supabase/server";
import { getTutorByOwner, insertTutorProfile } from "@/lib/queries/tutors";
import { parseGradesCsv } from "@/lib/tutorEligibility";
import { UNIVERSITIES } from "@/lib/constants/universities";
import { TOWNSHIPS } from "@/lib/constants/townships";

export interface ApplyAsTutorInput {
  csvText: string;
  name: string;
  photoUrl: string;
  subjects: string[];
  university: string;
  township: string;
  bio: string;
  pricePerSession: string;
  sessionMode: "online" | "in_person" | "both";
  availabilityNote: string;
}

export type ApplyAsTutorResult = { ok: true; tutorId: string } | { ok: false; error: string };

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
  const university = input.university.trim();
  const township = input.township.trim();
  const price = Number.parseInt(input.pricePerSession, 10);

  if (!name) return { ok: false, error: "Name is required." };
  if (input.subjects.length === 0) return { ok: false, error: "Select at least one subject you can teach." };
  if (!UNIVERSITIES.includes(university as (typeof UNIVERSITIES)[number])) {
    return { ok: false, error: "Select a valid university." };
  }
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
    const created = await insertTutorProfile(supabase, {
      name,
      photo_url: input.photoUrl.trim() || null,
      subjects: input.subjects,
      university,
      township,
      bio: input.bio.trim() || null,
      price_per_session: price,
      session_mode: input.sessionMode,
      availability_note: input.availabilityNote.trim() || null,
      owner_profile_id: user.id,
    });
    return { ok: true, tutorId: created.id };
  } catch {
    return { ok: false, error: "Couldn't save your tutor profile. Try again." };
  }
}
