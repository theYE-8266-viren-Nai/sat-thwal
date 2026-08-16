import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../../helpers/supabaseMock";
import {
  formatRouteStops,
  formatTime,
  getRouteById,
  getRoutes,
  getRoutesByIds,
  getRouteStops,
  routeToCard,
  routeToDetail,
  SAMPLE_UIT_ROUTES,
} from "@/lib/queries/transportation";

const route = {
  id: "route-1",
  driver_id: "driver-1",
  vehicle_number: "YGN-1",
  driver_name: "mamaphyo",
  route_name: "Dagon Seikkan - Thaketa - UIT",
  pickup_township: "Dagon Seikkan",
  route_stops: ["Dagon Seikkan", "Thaketa", "UIT"],
  route_pickup_times: ["06:10", "06:30", "07:55"],
  departure_time: "06:10",
  return_time: "17:20",
  monthly_price: 48000,
  total_seats: 18,
  available_seats: 9,
  vehicle_type: "Bus",
  verified: true,
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("lib/queries/transportation", () => {
  it.each([
    ["00:00", "12:00 AM"],
    ["12:05", "12:05 PM"],
    ["17:20", "5:20 PM"],
  ])("should format %s as %s", (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });

  it("should fetch routes, merge samples, and normalize repeated placeholder driver names", async () => {
    const supabase = createSupabaseMock({ transportation_routes: { data: [route], error: null } });

    const result = await getRoutes(supabase as never);

    expect(result.find((item) => item.route_name === route.route_name)?.driver_name).toBe("Ko Hein Htet");
    expect(result.length).toBeGreaterThanOrEqual(SAMPLE_UIT_ROUTES.length);
  });

  it("should throw when route fetch fails", async () => {
    const error = new Error("route query failed");
    const supabase = createSupabaseMock({ transportation_routes: { data: null, error } });

    await expect(getRoutes(supabase as never)).rejects.toThrow(error);
  });

  it("should return sample routes by id without hitting Supabase", async () => {
    const supabase = createSupabaseMock();

    const result = await getRouteById(supabase as never, SAMPLE_UIT_ROUTES[0].id);

    expect(result).toEqual(SAMPLE_UIT_ROUTES[0]);
    expect(supabase.calls).toEqual([]);
  });

  it("should return no routes for empty id arrays without querying", async () => {
    const supabase = createSupabaseMock();

    await expect(getRoutesByIds(supabase as never, [])).resolves.toEqual([]);
    expect(supabase.calls).toEqual([]);
  });

  it("should build route stops using fallback pickup township when stops are missing", () => {
    const stops = getRouteStops({ ...route, route_stops: [], route_pickup_times: null } as never);

    expect(stops).toEqual([
      { id: "route-1-stop-1", name: "Dagon Seikkan", pickupTime: undefined },
      { id: "route-1-stop-2", name: "UIT", pickupTime: undefined },
    ]);
    expect(formatRouteStops(route as never)).toBe("Dagon Seikkan -> Thaketa -> UIT");
  });

  it("should build transportation card and detail view models", () => {
    const card = routeToCard(route as never);
    const detail = routeToDetail(route as never);

    expect(card).toMatchObject({
      title: route.route_name,
      priceLabel: "48,000 MMK / month",
      ctaLabel: "Request Seat",
      driverName: "mamaphyo",
      departureTimeLabel: "6:10 AM",
      returnTimeLabel: "5:20 PM",
    });
    expect(detail.description).toContain("Approved ferry contact: mamaphyo");
    expect(detail.amenities).toContain("Dagon Seikkan at 6:10 AM");
  });
});