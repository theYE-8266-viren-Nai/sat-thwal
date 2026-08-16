import { describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "../../helpers/supabaseMock";
import {
  confirmFoodPackageRequest,
  createRequest,
  createTransportationRequest,
  getExistingActiveRequest,
  getPeerRequestBlockReason,
  getRequestsForRestaurant,
  markRequestCompletedByOwner,
  markRequestCompletedByRequester,
  normalizeRequestStatus,
  updateRequestStatus,
} from "@/lib/queries/requests";

const baseRequest = {
  id: "request-1",
  profile_id: "profile-1",
  service_type: "food",
  service_id: "package-1",
  status: "pending",
  note: null,
  pickup_stop_id: null,
  pickup_stop_name: null,
  pickup_time: null,
  pickup_address: null,
  rejection_reason: null,
  seen_by_student: true,
  requester_completed_at: null,
  owner_completed_at: null,
  completed_at: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("lib/queries/requests", () => {
  it("should normalize mutually completed confirmed requests", () => {
    const result = normalizeRequestStatus({
      ...baseRequest,
      status: "confirmed",
      requester_completed_at: "2026-01-02T00:00:00.000Z",
      owner_completed_at: "2026-01-03T00:00:00.000Z",
    } as never);

    expect(result.status).toBe("completed");
    expect(result.completed_at).toBe("2026-01-03T00:00:00.000Z");
  });

  it("should preserve non-completed requests", () => {
    const result = normalizeRequestStatus(baseRequest as never);

    expect(result).toBe(baseRequest);
  });

  it("should return null for unsupported active request category without querying", async () => {
    const supabase = createSupabaseMock();

    const result = await getExistingActiveRequest(supabase as never, "profile-1", "unknown" as never, "id");

    expect(result).toBeNull();
    expect(supabase.calls).toEqual([]);
  });

  it("should fetch an active request and normalize it", async () => {
    const supabase = createSupabaseMock({ requests: { data: baseRequest, error: null } });

    const result = await getExistingActiveRequest(supabase as never, "profile-1", "food", "package-1");

    expect(result).toEqual(baseRequest);
    expect(supabase.calls).toContainEqual({ table: "requests", method: "in", args: ["status", ["pending", "confirmed", "completed"]] });
  });

  it.each(["tutor", "hostel"] as const)("should allow %s owners to request peer listings", async (category) => {
    const supabase = createSupabaseMock();

    const result = await getPeerRequestBlockReason(supabase as never, "profile-1", category);

    expect(result).toBeNull();
    expect(supabase.calls).toEqual([]);
  });

  it.each([
    ["transportation", "transportation_routes", "Drivers can't book seats on transportation routes."],
    ["food", "restaurants", "Restaurant owners can't subscribe to food packages."],
  ] as const)("should block peer requests for %s providers", async (category, table, message) => {
    const supabase = createSupabaseMock({ [table]: { data: { id: "owned" }, error: null } });

    const result = await getPeerRequestBlockReason(supabase as never, "profile-1", category);

    expect(result).toBe(message);
  });

  it("should create a food request when not blocked and no duplicate exists", async () => {
    const supabase = createSupabaseMock({
      restaurants: { data: null, error: null },
      requests: [
        { data: null, error: null },
        { data: baseRequest, error: null },
      ],
    });

    const result = await createRequest(supabase as never, "profile-1", "food", "package-1", "note");

    expect(result).toEqual(baseRequest);
    expect(supabase.calls).toContainEqual({
      table: "requests",
      method: "insert",
      args: [{ profile_id: "profile-1", service_type: "food", service_id: "package-1", note: "note" }],
    });
  });

  it("should create a tutor request from a tutor account to another tutor", async () => {
    const tutorRequest = { ...baseRequest, service_type: "tutor", service_id: "tutor-2" };
    const supabase = createSupabaseMock({
      requests: [
        { data: null, error: null },
        { data: tutorRequest, error: null },
      ],
      tutors: { data: { verified: true }, error: null },
    });

    const result = await createRequest(supabase as never, "tutor-profile-1", "tutor", "tutor-2", "Need help");

    expect(result).toEqual(tutorRequest);
    expect(supabase.calls).toContainEqual({
      table: "requests",
      method: "insert",
      args: [{ profile_id: "tutor-profile-1", service_type: "tutor", service_id: "tutor-2", note: "Need help" }],
    });
  });

  it("should create a hostel request from a hostel owner to another hostel", async () => {
    const hostelRequest = { ...baseRequest, service_type: "hostel", service_id: "hostel-2" };
    const supabase = createSupabaseMock({
      requests: [
        { data: null, error: null },
        { data: hostelRequest, error: null },
      ],
      hostels: { data: { verified: true }, error: null },
    });

    const result = await createRequest(supabase as never, "hostel-owner-1", "hostel", "hostel-2", "Need a room");

    expect(result).toEqual(hostelRequest);
    expect(supabase.calls).toContainEqual({
      table: "requests",
      method: "insert",
      args: [{ profile_id: "hostel-owner-1", service_type: "hostel", service_id: "hostel-2", note: "Need a room" }],
    });
  });
  it("should reject duplicate active tutor request attempts before insert", async () => {
    const supabase = createSupabaseMock({
      requests: { data: { ...baseRequest, service_type: "tutor", service_id: "tutor-2" }, error: null },
    });

    await expect(createRequest(supabase as never, "tutor-profile-1", "tutor", "tutor-2")).rejects.toThrow(
      "already requested",
    );
  });

  it("should reject duplicate active hostel request attempts before insert", async () => {
    const supabase = createSupabaseMock({
      requests: { data: { ...baseRequest, service_type: "hostel", service_id: "hostel-2" }, error: null },
    });

    await expect(createRequest(supabase as never, "hostel-owner-1", "hostel", "hostel-2")).rejects.toThrow(
      "already requested",
    );
  });
  it("should reject tutor requests for unverified tutor listings", async () => {
    const supabase = createSupabaseMock({
      requests: { data: null, error: null },
      tutors: { data: { verified: false }, error: null },
    });

    await expect(createRequest(supabase as never, "profile-1", "tutor", "tutor-2")).rejects.toThrow(
      "awaiting admin approval",
    );
    expect(supabase.calls.some((call) => call.table === "requests" && call.method === "insert")).toBe(false);
  });
  it("should reject hostel requests for unverified hostel listings", async () => {
    const supabase = createSupabaseMock({
      requests: { data: null, error: null },
      hostels: { data: { verified: false }, error: null },
    });

    await expect(createRequest(supabase as never, "profile-1", "hostel", "hostel-2")).rejects.toThrow(
      "awaiting school approval",
    );
    expect(supabase.calls.some((call) => call.table === "requests" && call.method === "insert")).toBe(false);
  });
  it("should reject duplicate createRequest attempts before insert", async () => {
    const supabase = createSupabaseMock({
      restaurants: { data: null, error: null },
      requests: { data: baseRequest, error: null },
    });

    await expect(createRequest(supabase as never, "profile-1", "food", "package-1")).rejects.toThrow(
      "already requested",
    );
  });

  it("should convert duplicate database insert errors to friendly messages", async () => {
    const supabase = createSupabaseMock({
      restaurants: { data: null, error: null },
      requests: [
        { data: null, error: null },
        { data: null, error: { code: "23505" } },
      ],
    });

    await expect(createRequest(supabase as never, "profile-1", "food", "package-1")).rejects.toThrow(
      "already requested",
    );
  });

  it("should create a transportation request, update phone, and return driver metadata", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-04T05:06:07.000Z"));
    const supabase = createSupabaseMock({
      transportation_routes: [
        { data: { driver_id: "driver-1", route_name: "Route A" }, error: null },
        { data: null, error: null },
      ],
      requests: [
        { data: null, error: null },
        { data: { ...baseRequest, service_type: "transportation", service_id: "route-1" }, error: null },
      ],
      profiles: { data: null, error: null },
    });

    const result = await createTransportationRequest(
      supabase as never,
      "student-1",
      "route-1",
      "stop-1",
      "Hlaing",
      "7:00 AM",
      "Dorm 1",
      "099999999",
    );

    expect(result.driverId).toBe("driver-1");
    expect(result.routeName).toBe("Route A");
    expect(supabase.calls).toContainEqual({
      table: "profiles",
      method: "update",
      args: [{ phone: "099999999", updated_at: "2026-03-04T05:06:07.000Z" }],
    });
    vi.useRealTimers();
  });

  it("should reject transportation requests for missing or unassigned routes", async () => {
    await expect(
      createTransportationRequest(
        createSupabaseMock({ transportation_routes: { data: null, error: null } }) as never,
        "student-1",
        "route-1",
        undefined,
        undefined,
        undefined,
        "Dorm",
        "09",
      ),
    ).rejects.toThrow("route not found");

    await expect(
      createTransportationRequest(
        createSupabaseMock({ transportation_routes: { data: { driver_id: null, route_name: "A" }, error: null } }) as never,
        "student-1",
        "route-1",
        undefined,
        undefined,
        undefined,
        "Dorm",
        "09",
      ),
    ).rejects.toThrow("not assigned");
  });

  it("should update request status with response flags and rejection reason", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-05T06:07:08.000Z"));
    const supabase = createSupabaseMock({ requests: { data: null, error: null } });

    await updateRequestStatus(supabase as never, "request-1", "cancelled", "Full");

    expect(supabase.calls).toContainEqual({
      table: "requests",
      method: "update",
      args: [{ status: "cancelled", updated_at: "2026-04-05T06:07:08.000Z", seen_by_student: false, rejection_reason: "Full" }],
    });
    vi.useRealTimers();
  });

  it("should call request RPC helpers and normalize returned rows", async () => {
    const rpcRow = { ...baseRequest, status: "confirmed" };
    const supabase = createSupabaseMock({
      "rpc:confirm_food_package_request": { data: rpcRow, error: null },
      "rpc:confirm_request_received": { data: rpcRow, error: null },
      "rpc:mark_request_provided": { data: rpcRow, error: null },
    });

    await expect(confirmFoodPackageRequest(supabase as never, "request-1")).resolves.toEqual(rpcRow);
    await expect(markRequestCompletedByRequester(supabase as never, "request-1")).resolves.toEqual(rpcRow);
    await expect(markRequestCompletedByOwner(supabase as never, "request-1")).resolves.toEqual(rpcRow);
    expect(supabase.calls).toContainEqual({ method: "rpc", args: ["confirm_food_package_request", { p_request_id: "request-1" }] });
  });

  it("should return no restaurant requests when the restaurant has no packages", async () => {
    const supabase = createSupabaseMock({ food_packages: { data: [], error: null } });

    const result = await getRequestsForRestaurant(supabase as never, "restaurant-1");

    expect(result).toEqual([]);
  });
});