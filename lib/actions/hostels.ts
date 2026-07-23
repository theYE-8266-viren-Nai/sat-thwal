"use server";

import { createClient } from "@/lib/supabase/server";
import { getHostelByOwner, insertHostelListing, updateHostelListing } from "@/lib/queries/hostels";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { HOSTEL_ROOM_TYPES } from "@/lib/constants/facilities";
import { getProviderRegistration } from "@/lib/queries/providerRegistrations";
import { isProviderPaymentMethod } from "@/lib/providerRegistration";
import { toErrorMessage } from "@/lib/supabase/errors";
import type {
  GenderPolicy,
  ProviderPaymentMethod,
} from "@/types/database.types";

export interface HostelRoomInput {
  name: string;
  imageUrl: string;
  township: string;
  distanceKm: string;
  monthlyRent: string;
  genderPolicy: GenderPolicy;
  roomType: string;
  facilities: string[];
  availableRooms: string;
  mealsIncluded: boolean;
  description: string;
  paymentMethod?: ProviderPaymentMethod;
  transactionReference?: string;
}

function validateHostelRoomInput(input: HostelRoomInput) {
  const name = input.name.trim();
  const township = input.township.trim();
  const distance = Number.parseFloat(input.distanceKm);
  const rent = Number.parseInt(input.monthlyRent, 10);
  const availableRooms = Number.parseInt(input.availableRooms, 10);

  if (!name) return { ok: false as const, error: "Give your listing a name." };
  if (!TOWNSHIPS.includes(township as (typeof TOWNSHIPS)[number])) {
    return { ok: false as const, error: "Select a valid township." };
  }
  if (!Number.isFinite(distance) || distance < 0) {
    return { ok: false as const, error: "Enter a valid distance from your university." };
  }
  if (!Number.isFinite(rent) || rent <= 0) {
    return { ok: false as const, error: "Monthly rent must be a positive number." };
  }
  if (!["male", "female", "mixed"].includes(input.genderPolicy)) {
    return { ok: false as const, error: "Select a valid gender policy." };
  }
  if (!HOSTEL_ROOM_TYPES.includes(input.roomType as (typeof HOSTEL_ROOM_TYPES)[number])) {
    return { ok: false as const, error: "Select a valid room type." };
  }
  if (!Number.isFinite(availableRooms) || availableRooms <= 0) {
    return { ok: false as const, error: "Available rooms must be at least 1." };
  }
  return {
    ok: true as const,
    value: { name, township, distance, rent, availableRooms },
  };
}

export type HostelRoomResult =
  | { ok: true; hostelId: string }
  | { ok: false; error: string; hostelId?: string };

export async function listHostelRoom(input: HostelRoomInput): Promise<HostelRoomResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired — please log in again." };

  const existing = await getHostelByOwner(supabase, user.id);
  if (existing) return { ok: false, error: "already-listed" };
  if (!input.paymentMethod || !isProviderPaymentMethod(input.paymentMethod)) {
    return { ok: false, error: "Select a valid payment method." };
  }
  if (!input.transactionReference?.trim()) {
    return { ok: false, error: "Enter the payment transaction reference." };
  }

  const validated = validateHostelRoomInput(input);
  if (!validated.ok) return validated;
  const { name, township, distance, rent, availableRooms } = validated.value;

  let createdHostelId: string | undefined;
  try {
    const created = await insertHostelListing(supabase, {
      name,
      image_url: input.imageUrl.trim() || null,
      township,
      distance_km: distance,
      monthly_rent: rent,
      gender_policy: input.genderPolicy,
      room_type: input.roomType,
      facilities: input.facilities,
      available_rooms: availableRooms,
      meals_included: input.mealsIncluded,
      description: input.description.trim() || null,
      owner_profile_id: user.id,
    });
    createdHostelId = created.id;

    const registration = await getProviderRegistration(supabase, user.id, "hostel");
    if (!registration) throw new Error("The hostel payment registration was not created.");

    const { error: paymentError } = await supabase.rpc(
      "submit_provider_registration_payment",
      {
        p_registration_id: registration.id,
        p_payment_method: input.paymentMethod,
        p_transaction_reference: input.transactionReference.trim(),
      },
    );
    if (paymentError) throw paymentError;

    return { ok: true, hostelId: created.id };
  } catch (error) {
    return {
      ok: false,
      error: createdHostelId
        ? `Your room was saved, but the payment reference needs to be submitted again. ${toErrorMessage(error)}`
        : "Couldn't save your listing. Try again.",
      hostelId: createdHostelId,
    };
  }
}

export async function editHostelRoom(input: HostelRoomInput): Promise<HostelRoomResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired — please log in again." };

  const existing = await getHostelByOwner(supabase, user.id);
  if (!existing) return { ok: false, error: "You don't have a room listed yet." };

  const validated = validateHostelRoomInput(input);
  if (!validated.ok) return validated;
  const { name, township, distance, rent, availableRooms } = validated.value;

  try {
    const updated = await updateHostelListing(supabase, existing.id, {
      name,
      image_url: input.imageUrl.trim() || null,
      township,
      distance_km: distance,
      monthly_rent: rent,
      gender_policy: input.genderPolicy,
      room_type: input.roomType,
      facilities: input.facilities,
      available_rooms: availableRooms,
      meals_included: input.mealsIncluded,
      description: input.description.trim() || null,
    });
    return { ok: true, hostelId: updated.id };
  } catch {
    return { ok: false, error: "Couldn't save your changes. Try again." };
  }
}
