import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminAuditEntityType,
  AdminAuditEventType,
  Database,
  ProviderType,
  ServiceType,
} from "@/types/database.types";

export type AdminAuditCategory = ServiceType | ProviderType;

export interface AdminAuditFilters {
  entityType?: AdminAuditEntityType;
  eventType?: AdminAuditEventType;
  category?: AdminAuditCategory;
  from?: string;
  to?: string;
}

export interface AdminAuditEvent {
  id: string;
  entityType: AdminAuditEntityType;
  entityId: string;
  eventType: AdminAuditEventType;
  actorProfileId: string | null;
  actorName: string | null;
  actorRole: string | null;
  summary: string;
  category: AdminAuditCategory | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export const AUDIT_ENTITY_LABELS: Record<AdminAuditEntityType, string> = {
  request: "Student request",
  provider_registration: "Provider approval",
};

export const AUDIT_EVENT_LABELS: Record<AdminAuditEventType, string> = {
  request_created: "Request created",
  request_confirmed: "Request confirmed",
  request_cancelled: "Request cancelled",
  request_owner_completed: "Provider confirmed",
  request_student_completed: "Student confirmed",
  request_completed: "Request resolved",
  provider_payment_submitted: "Provider submitted",
  provider_approved: "Provider approved",
  provider_rejected: "Provider rejected",
};

export const AUDIT_CATEGORY_LABELS: Record<AdminAuditCategory, string> = {
  tutor: "Tutors",
  hostel: "Hostels",
  food: "Food",
  transportation: "Transportation",
  restaurant: "Restaurants",
};

const AUDIT_LIMIT = 150;

export async function getAdminAuditEvents(
  supabase: SupabaseClient<Database>,
  filters: AdminAuditFilters = {},
  limit = AUDIT_LIMIT,
): Promise<AdminAuditEvent[]> {
  let query = supabase
    .from("admin_audit_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.entityType) query = query.eq("entity_type", filters.entityType);
  if (filters.eventType) query = query.eq("event_type", filters.eventType);
  if (filters.from) query = query.gte("created_at", startOfDayIso(filters.from));
  if (filters.to) query = query.lte("created_at", endOfDayIso(filters.to));

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const actorIds = [
    ...new Set(
      rows
        .map((event) => event.actor_profile_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const actorNames = await getActorNames(supabase, actorIds);

  return rows
    .map((event) => {
      const metadata = normalizeMetadata(event.metadata);
      const category = getAuditCategory(event.entity_type, metadata);

      return {
        id: event.id,
        entityType: event.entity_type,
        entityId: event.entity_id,
        eventType: event.event_type,
        actorProfileId: event.actor_profile_id,
        actorName: event.actor_profile_id
          ? actorNames.get(event.actor_profile_id) ?? null
          : null,
        actorRole: event.actor_role,
        summary: event.summary,
        category,
        metadata,
        createdAt: event.created_at,
      };
    })
    .filter((event) => !filters.category || event.category === filters.category);
}

export function auditFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AdminAuditFilters {
  const entityType = firstValue(searchParams.entityType);
  const eventType = firstValue(searchParams.eventType);
  const category = firstValue(searchParams.category);
  const from = firstValue(searchParams.from);
  const to = firstValue(searchParams.to);

  return {
    entityType: isAuditEntityType(entityType) ? entityType : undefined,
    eventType: isAuditEventType(eventType) ? eventType : undefined,
    category: isAuditCategory(category) ? category : undefined,
    from: isDateInput(from) ? from : undefined,
    to: isDateInput(to) ? to : undefined,
  };
}

export function getAuditExportUrl(filters: AdminAuditFilters) {
  const params = new URLSearchParams();
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.eventType) params.set("eventType", filters.eventType);
  if (filters.category) params.set("category", filters.category);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const query = params.toString();
  return `/api/admin/audit-trail/export${query ? `?${query}` : ""}`;
}

export function createAdminAuditCsv(events: AdminAuditEvent[]) {
  const headers = [
    "timestamp",
    "entity_type",
    "event_type",
    "actor",
    "actor_role",
    "summary",
    "entity_id",
    "metadata",
  ];

  const rows = events.map((event) => [
    event.createdAt,
    event.entityType,
    event.eventType,
    event.actorName ?? event.actorProfileId ?? "System",
    event.actorRole ?? "",
    event.summary,
    event.entityId,
    JSON.stringify(event.metadata),
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function getAuditCategory(
  entityType: AdminAuditEntityType,
  metadata: Record<string, unknown>,
): AdminAuditCategory | null {
  const value =
    entityType === "request" ? metadata.service_type : metadata.provider_type;
  return isAuditCategory(value) ? value : null;
}

async function getActorNames(
  supabase: SupabaseClient<Database>,
  actorIds: string[],
) {
  if (actorIds.length === 0) return new Map<string, string>();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", actorIds);
  if (error) throw error;

  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      profile.full_name ?? "Unnamed user",
    ]),
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isAuditEntityType(value: unknown): value is AdminAuditEntityType {
  return value === "request" || value === "provider_registration";
}

function isAuditEventType(value: unknown): value is AdminAuditEventType {
  return (
    value === "request_created" ||
    value === "request_confirmed" ||
    value === "request_cancelled" ||
    value === "request_owner_completed" ||
    value === "request_student_completed" ||
    value === "request_completed" ||
    value === "provider_payment_submitted" ||
    value === "provider_approved" ||
    value === "provider_rejected"
  );
}

function isAuditCategory(value: unknown): value is AdminAuditCategory {
  return (
    value === "tutor" ||
    value === "hostel" ||
    value === "food" ||
    value === "transportation" ||
    value === "restaurant"
  );
}

function isDateInput(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function startOfDayIso(value: string) {
  return `${value}T00:00:00.000Z`;
}

function endOfDayIso(value: string) {
  return `${value}T23:59:59.999Z`;
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
