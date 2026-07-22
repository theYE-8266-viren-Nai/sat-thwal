import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  TransportationRegistrationStatus,
} from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";
import { routeToCard, type TransportationRow } from "@/lib/queries/transportation";
import { throwSupabaseError } from "@/lib/supabase/errors";

export type TransportationRegistrationRow =
  Database["public"]["Tables"]["transportation_registrations"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export type TransportationRegistrationWithDetails = TransportationRegistrationRow & {
  route?: TransportationRow | null;
  student?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
};

type TransportationRegistrationWithRoute = TransportationRegistrationRow & {
  route?: TransportationRow | null;
};

export async function createTransportationRegistration(
  supabase: SupabaseClient<Database>,
  studentId: string,
  routeId: string,
  pickupStopId: string,
  pickupStopName: string,
  pickupTime: string | undefined,
  pickupAddress: string,
) {
  const { data: route, error: routeError } = await supabase
    .from("transportation_routes")
    .select("*")
    .eq("id", routeId)
    .maybeSingle();
  if (routeError) throwSupabaseError(routeError, "Could not load transportation route.");
  if (!route) {
    throw new Error("Transportation route not found.");
  }
  if (!route.driver_id) {
    throw new Error("This route is not assigned to a driver yet.");
  }

  const { data: student } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", studentId)
    .maybeSingle();
  const studentName = student?.full_name ?? "A student";

  const { data: registration, error } = await supabase
    .from("transportation_registrations")
    .insert({
      student_id: studentId,
      route_id: routeId,
      driver_id: route.driver_id,
      pickup_stop_id: pickupStopId,
      pickup_stop_name: pickupStopName,
      pickup_time: pickupTime,
      pickup_address: pickupAddress,
    })
    .select("*")
    .single();
  if (error) throwSupabaseError(error, "Could not create transportation registration.");

  await supabase.from("notifications").insert({
    recipient_id: route.driver_id,
    sender_id: studentId,
    route_id: routeId,
    registration_id: registration.id,
    type: "transportation_registration",
    title: "New seat request",
    message: `New seat request from ${studentName} for ${route.route_name}.`,
  });

  return registration;
}

export async function getDriverRoutes(supabase: SupabaseClient<Database>, driverId: string) {
  const { data, error } = await supabase
    .from("transportation_routes")
    .select("*")
    .eq("driver_id", driverId)
    .order("departure_time", { ascending: true });
  if (error) throwSupabaseError(error, "Could not load driver routes.");
  return data ?? [];
}

export async function getDriverRegistrations(
  supabase: SupabaseClient<Database>,
  driverId: string,
) {
  const { data, error } = await supabase
    .from("transportation_registrations")
    .select(
      "*, route:transportation_routes(*), student:profiles!transportation_registrations_student_id_fkey(id, full_name, avatar_url, phone)",
    )
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });
  if (error) throwSupabaseError(error, "Could not load driver registrations.");
  return (data ?? []) as unknown as TransportationRegistrationWithDetails[];
}

export async function getDriverNotifications(
  supabase: SupabaseClient<Database>,
  driverId: string,
) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", driverId)
    .order("created_at", { ascending: false });
  if (error) throwSupabaseError(error, "Could not load driver notifications.");
  return data ?? [];
}

export async function updateTransportationRegistrationStatus(
  supabase: SupabaseClient<Database>,
  registrationId: string,
  status: TransportationRegistrationStatus,
  rejectionReason?: string,
) {
  const { data: registrationData, error: registrationError } = await supabase
    .from("transportation_registrations")
    .select("*, route:transportation_routes(*)")
    .eq("id", registrationId)
    .maybeSingle();
  if (registrationError) throwSupabaseError(registrationError, "Could not load registration.");
  const registration = registrationData as unknown as TransportationRegistrationWithRoute | null;
  if (!registration) throw new Error("Registration not found.");
  if (registration.status === "approved" && status === "approved") {
    return registration;
  }
  if (registration.status !== "pending") {
    throw new Error("Only pending registrations can be updated.");
  }

  if (status === "approved") {
    const availableSeats = registration.route?.available_seats ?? 0;
    if (availableSeats <= 0) throw new Error("No seats are available on this route.");
  }

  const { data: updated, error } = await supabase
    .from("transportation_registrations")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason ?? null : null,
      updated_at: new Date().toISOString(),
      approved_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", registrationId)
    .select("*")
    .single();
  if (error) throwSupabaseError(error, "Could not update registration status.");

  if (status === "approved") {
    const { error: routeUpdateError } = await supabase
      .from("transportation_routes")
      .update({ available_seats: Math.max((registration.route?.available_seats ?? 1) - 1, 0) })
      .eq("id", registration.route_id);
    if (routeUpdateError) throwSupabaseError(routeUpdateError, "Could not update available seats.");
  }

  const routeName = registration.route?.route_name ?? "your transportation route";
  const { error: notificationError } = await supabase.from("notifications").insert({
    recipient_id: registration.student_id,
    sender_id: registration.driver_id,
    route_id: registration.route_id,
    registration_id: registration.id,
    type: `transportation_registration_${status}`,
    title: status === "approved" ? "Seat request approved" : "Seat request rejected",
    message:
      status === "approved"
        ? `Your seat request for ${routeName} was approved.`
        : `Your seat request for ${routeName} was rejected.`,
  });
  if (notificationError) throwSupabaseError(notificationError, "Could not create notification.");

  return updated;
}

export async function markNotificationRead(
  supabase: SupabaseClient<Database>,
  notificationId: string,
) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
  if (error) throwSupabaseError(error, "Could not mark notification as read.");
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient<Database>,
  driverId: string,
) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", driverId)
    .eq("is_read", false);
  if (error) throwSupabaseError(error, "Could not mark notifications as read.");
}

export function registrationsToCards(registrations: TransportationRegistrationWithDetails[]) {
  const cards = new Map<string, ServiceCardData>();
  registrations.forEach((registration) => {
    if (registration.route) {
      cards.set(registration.route.id, routeToCard(registration.route));
    }
  });
  return cards;
}
