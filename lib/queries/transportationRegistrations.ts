import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { throwSupabaseError } from "@/lib/supabase/errors";
import { getProfilesByIds } from "@/lib/queries/profiles";
import {
  createTransportationRequest as insertTransportationRequest,
  normalizeRequestStatus,
  updateRequestStatus,
  type RequestRow,
} from "@/lib/queries/requests";
import type { TransportationRow } from "@/lib/queries/transportation";

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export type TransportationRegistrationWithDetails = RequestRow & {
  route?: TransportationRow | null;
  student?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
};

export async function createTransportationRegistration(
  supabase: SupabaseClient<Database>,
  studentId: string,
  routeId: string,
  pickupStopId: string,
  pickupStopName: string,
  pickupTime: string | undefined,
  pickupAddress: string,
  phone: string,
) {
  const { request, driverId, routeName } = await insertTransportationRequest(
    supabase,
    studentId,
    routeId,
    pickupStopId,
    pickupStopName,
    pickupTime,
    pickupAddress,
    phone,
  );

  const { data: student } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", studentId)
    .maybeSingle();

  await supabase.from("notifications").insert({
    recipient_id: driverId,
    sender_id: studentId,
    route_id: routeId,
    registration_id: request.id,
    type: "transportation_registration",
    title: "New seat request",
    message: `New seat request from ${student?.full_name ?? "A student"} for ${routeName}.`,
  });

  return request;
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
  const routes = await getDriverRoutes(supabase, driverId);
  if (routes.length === 0) return [];
  const routeById = new Map(routes.map((route) => [route.id, route]));

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("service_type", "transportation")
    .in("service_id", routes.map((route) => route.id))
    .order("created_at", { ascending: false });
  if (error) throwSupabaseError(error, "Could not load driver registrations.");
  const requests = (data ?? []).map(normalizeRequestStatus);

  const students = await getProfilesByIds(supabase, [...new Set(requests.map((r) => r.profile_id))]);
  const studentById = new Map(students.map((student) => [student.id, student]));

  return requests.map((request) => ({
    ...request,
    route: routeById.get(request.service_id) ?? null,
    student: studentById.get(request.profile_id) ?? null,
  })) as TransportationRegistrationWithDetails[];
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

export async function confirmTransportationRequest(
  supabase: SupabaseClient<Database>,
  requestId: string,
) {
  const { data, error } = await supabase.rpc("confirm_transportation_request", {
    p_request_id: requestId,
  });
  if (error) throwSupabaseError(error, "Could not confirm this request.");
  const updated = normalizeRequestStatus(data);

  const { data: route } = await supabase
    .from("transportation_routes")
    .select("route_name, driver_id")
    .eq("id", updated.service_id)
    .maybeSingle();

  await supabase.from("notifications").insert({
    recipient_id: updated.profile_id,
    sender_id: route?.driver_id,
    route_id: updated.service_id,
    registration_id: updated.id,
    type: "transportation_registration_confirmed",
    title: "Seat request approved",
    message: `Your seat request for ${route?.route_name ?? "your transportation route"} was approved.`,
  });

  return updated;
}

export async function rejectTransportationRequest(
  supabase: SupabaseClient<Database>,
  requestId: string,
  reason?: string,
) {
  const { data: request, error: fetchError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (fetchError) throwSupabaseError(fetchError, "Could not load this request.");
  if (!request) throw new Error("Request not found.");

  await updateRequestStatus(supabase, requestId, "cancelled", reason);

  const { data: route } = await supabase
    .from("transportation_routes")
    .select("route_name, driver_id")
    .eq("id", request.service_id)
    .maybeSingle();

  await supabase.from("notifications").insert({
    recipient_id: request.profile_id,
    sender_id: route?.driver_id,
    route_id: request.service_id,
    registration_id: request.id,
    type: "transportation_registration_rejected",
    title: "Seat request rejected",
    message: `Your seat request for ${route?.route_name ?? "your transportation route"} was rejected.`,
  });

  return normalizeRequestStatus({ ...request, status: "cancelled" as const, rejection_reason: reason ?? null });
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
