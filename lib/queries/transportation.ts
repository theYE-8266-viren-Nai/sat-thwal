import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { RouteStop, ServiceCardData } from "@/types/domain";
import type { ServiceDetailData } from "@/types/detail";
import { formatMMK } from "@/lib/utils";

export type TransportationRow = Database["public"]["Tables"]["transportation_routes"]["Row"];

const SAMPLE_CREATED_AT = "2026-07-22T00:00:00.000Z";

type SampleTransportationRoute = Omit<TransportationRow, "driver_id" | "vehicle_number"> &
  Partial<Pick<TransportationRow, "driver_id" | "vehicle_number">>;

function sampleRoute(route: SampleTransportationRoute): TransportationRow {
  return {
    driver_id: null,
    vehicle_number: null,
    ...route,
  };
}

export const SAMPLE_UIT_ROUTES: TransportationRow[] = [
  sampleRoute(
  {
    id: "11111111-1111-4111-8111-111111111111",
    driver_name: "Ko Nay Lin",
    route_name: "Sanchaung - UIT Express",
    pickup_township: "Sanchaung",
    route_stops: ["Sanchaung", "Hledan", "Hlaing", "UIT"],
    route_pickup_times: ["07:00", "07:15", "07:25", "07:45"],
    departure_time: "07:00",
    return_time: "16:15",
    monthly_price: 28000,
    total_seats: 12,
    available_seats: 6,
    vehicle_type: "Van",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "22222222-2222-4222-8222-222222222222",
    driver_name: "Daw May Thu",
    route_name: "South Okkalapa - North Dagon - UIT",
    pickup_township: "South Okkalapa",
    route_stops: ["South Okkalapa", "North Dagon", "Hlaing", "UIT"],
    route_pickup_times: ["06:30", "06:50", "07:20", "07:45"],
    departure_time: "06:30",
    return_time: "17:10",
    monthly_price: 45000,
    total_seats: 16,
    available_seats: 6,
    vehicle_type: "Bus",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "33333333-3333-4333-8333-333333333333",
    driver_name: "Ko Min Thu",
    route_name: "Tamwe - Bahan - UIT Line",
    pickup_township: "Tamwe",
    route_stops: ["Tamwe", "Bahan", "Hledan", "UIT"],
    route_pickup_times: ["06:45", "07:00", "07:18", "07:45"],
    departure_time: "06:45",
    return_time: "16:45",
    monthly_price: 34000,
    total_seats: 12,
    available_seats: 4,
    vehicle_type: "Van",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "44444444-4444-4444-8444-444444444444",
    driver_name: "Daw Khin Mar Oo",
    route_name: "Insein - Bayint Naung - UIT Ferry",
    pickup_township: "Insein",
    route_stops: ["Insein", "Bayint Naung", "Hlaing", "UIT"],
    route_pickup_times: ["06:50", "07:05", "07:25", "07:45"],
    departure_time: "06:50",
    return_time: "17:00",
    monthly_price: 40000,
    total_seats: 10,
    available_seats: 2,
    vehicle_type: "Ferry + Van",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "55555555-5555-4555-8555-555555555555",
    driver_name: "Daw Nilar Win",
    route_name: "Thingangyun - Tamwe - UIT Bus",
    pickup_township: "Thingangyun",
    route_stops: ["Thingangyun", "Tamwe", "Hledan", "UIT"],
    route_pickup_times: ["06:40", "06:55", "07:25", "07:50"],
    departure_time: "06:40",
    return_time: "17:15",
    monthly_price: 38000,
    total_seats: 16,
    available_seats: 7,
    vehicle_type: "Bus",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "66666666-6666-4666-8666-666666666666",
    driver_name: "Ko Htet Aung",
    route_name: "Yankin - Bahan - UIT Shuttle",
    pickup_township: "Yankin",
    route_stops: ["Yankin", "Bahan", "Kamayut", "UIT"],
    route_pickup_times: ["06:35", "06:50", "07:10", "07:40"],
    departure_time: "06:35",
    return_time: "16:40",
    monthly_price: 36000,
    total_seats: 14,
    available_seats: 5,
    vehicle_type: "Van",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "77777777-7777-4777-8777-777777777777",
    driver_name: "Ko Aung Myint",
    route_name: "North Dagon - Thingangyun - UIT",
    pickup_township: "North Dagon",
    route_stops: ["North Dagon", "South Okkalapa", "Thingangyun", "UIT"],
    route_pickup_times: ["06:25", "06:45", "07:05", "07:50"],
    departure_time: "06:25",
    return_time: "17:05",
    monthly_price: 43000,
    total_seats: 15,
    available_seats: 5,
    vehicle_type: "Bus",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "88888888-8888-4888-8888-888888888888",
    driver_name: "Ko Pyae Sone",
    route_name: "Mayangone - 8 Mile - UIT",
    pickup_township: "Mayangone",
    route_stops: ["Mayangone", "8 Mile", "Hlaing", "UIT"],
    route_pickup_times: ["07:05", "07:15", "07:30", "07:45"],
    departure_time: "07:05",
    return_time: "16:20",
    monthly_price: 30000,
    total_seats: 12,
    available_seats: 8,
    vehicle_type: "Van",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "99999999-9999-4999-8999-999999999999",
    driver_name: "Daw Hnin Wai",
    route_name: "Ahlone - Sanchaung - UIT",
    pickup_township: "Ahlone",
    route_stops: ["Ahlone", "Sanchaung", "Hledan", "UIT"],
    route_pickup_times: ["06:55", "07:10", "07:25", "07:50"],
    departure_time: "06:55",
    return_time: "16:35",
    monthly_price: 35000,
    total_seats: 13,
    available_seats: 4,
    vehicle_type: "Van",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    driver_name: "Ko Hein Htet",
    route_name: "Dagon Seikkan - Thaketa - UIT",
    pickup_township: "Dagon Seikkan",
    route_stops: ["Dagon Seikkan", "Thaketa", "Tamwe", "Hledan", "UIT"],
    route_pickup_times: ["06:10", "06:30", "06:55", "07:25", "07:55"],
    departure_time: "06:10",
    return_time: "17:20",
    monthly_price: 48000,
    total_seats: 18,
    available_seats: 9,
    vehicle_type: "Bus",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    driver_name: "Daw Su Mon",
    route_name: "Mingaladon - North Okkalapa - UIT",
    pickup_township: "Mingaladon",
    route_stops: ["Mingaladon", "North Okkalapa", "Mayangone", "UIT"],
    route_pickup_times: ["06:20", "06:45", "07:10", "07:50"],
    departure_time: "06:20",
    return_time: "17:00",
    monthly_price: 46000,
    total_seats: 15,
    available_seats: 3,
    vehicle_type: "Van",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
  sampleRoute(
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    driver_name: "Ko Wai Yan",
    route_name: "Kyimyindaing - Sanchaung - UIT",
    pickup_township: "Kyimyindaing",
    route_stops: ["Kyimyindaing", "Sanchaung", "Kamayut", "UIT"],
    route_pickup_times: ["06:50", "07:05", "07:20", "07:45"],
    departure_time: "06:50",
    return_time: "16:30",
    monthly_price: 33000,
    total_seats: 12,
    available_seats: 6,
    vehicle_type: "Van",
    verified: true,
    created_at: SAMPLE_CREATED_AT,
  },
  ),
];

function mergeSampleRoutes(routes: TransportationRow[]) {
  const routeMap = new Map<string, TransportationRow>();

  SAMPLE_UIT_ROUTES.forEach((route) => routeMap.set(route.route_name, route));
  routes.forEach((route) => routeMap.set(route.route_name, route));

  return [...routeMap.values()].sort((a, b) => a.departure_time.localeCompare(b.departure_time));
}

export async function getRoutes(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("transportation_routes")
    .select("*")
    .order("departure_time", { ascending: true });
  if (error) throw error;
  return mergeSampleRoutes(data ?? []);
}

export async function getRouteById(supabase: SupabaseClient<Database>, id: string) {
  const sampleRoute = SAMPLE_UIT_ROUTES.find((route) => route.id === id);
  if (sampleRoute) return sampleRoute;

  const { data, error } = await supabase
    .from("transportation_routes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getRoutesByIds(supabase: SupabaseClient<Database>, ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("transportation_routes")
    .select("*")
    .in("id", ids);
  if (error) throw error;
  const selectedSamples = SAMPLE_UIT_ROUTES.filter((route) => ids.includes(route.id));
  return mergeSampleRoutes([...(data ?? []), ...selectedSamples]).filter((route) =>
    ids.includes(route.id),
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function getRouteStops(route: TransportationRow): RouteStop[] {
  const stopNames = route.route_stops?.length
    ? route.route_stops
    : [route.pickup_township, "UIT"];
  const pickupTimes = route.route_pickup_times ?? [];

  return stopNames.map((name, index) => ({
    id: `${route.id}-stop-${index + 1}`,
    name,
    pickupTime: pickupTimes[index] ? formatTime(pickupTimes[index]) : undefined,
  }));
}

export function formatRouteStops(route: TransportationRow) {
  return getRouteStops(route)
    .map((stop) => stop.name)
    .join(" -> ");
}

export function routeToCard(route: TransportationRow): ServiceCardData {
  const routeStops = getRouteStops(route);
  const departureTimeLabel = formatTime(route.departure_time);
  const returnTimeLabel = formatTime(route.return_time);

  return {
    id: route.id,
    category: "transportation",
    image: null,
    title: route.route_name,
    subtitle: routeStops.map((stop) => stop.name).join(" -> "),
    priceLabel: `${formatMMK(route.monthly_price)} / month`,
    verified: route.verified,
    meta: [
      { icon: "bus", label: route.vehicle_type ?? "Shared vehicle" },
      { icon: "clock", label: `Departs ${departureTimeLabel}` },
      { icon: "clock", label: `Returns ${returnTimeLabel}` },
      { icon: "users", label: `${route.available_seats} seats available` },
    ],
    ctaLabel: "Book Seat",
    href: `/services/transportation/${route.id}`,
    routeStops,
    driverName: route.driver_name,
    vehicleType: route.vehicle_type,
    departureTimeLabel,
    returnTimeLabel,
    availableSeats: route.available_seats,
    totalSeats: route.total_seats,
  };
}

export function routeToDetail(route: TransportationRow): ServiceDetailData {
  const routeStops = getRouteStops(route);
  const routeStopsLabel = routeStops.map((stop) => stop.name).join(" -> ");
  const departureTimeLabel = formatTime(route.departure_time);
  const returnTimeLabel = formatTime(route.return_time);

  return {
    id: route.id,
    category: "transportation",
    image: null,
    title: route.route_name,
    providerName: route.driver_name,
    providerAvatar: null,
    verified: route.verified,
    priceLabel: `${formatMMK(route.monthly_price)} / month`,
    availabilityLines: [
      `Morning departure ${departureTimeLabel}`,
      `Evening return ${returnTimeLabel}`,
      `${route.available_seats} of ${route.total_seats} seats available`,
    ],
    locationLabel: routeStopsLabel,
    description: `Driver: ${route.driver_name}. Vehicle: ${
      route.vehicle_type ?? "Shared vehicle"
    }. This UIT route covers ${routeStopsLabel}. Fill in your detailed pickup address when booking so the driver can confirm the exact pickup point.`,
    amenities: [
      `Driver: ${route.driver_name}`,
      `Vehicle: ${route.vehicle_type ?? "Shared vehicle"}`,
      ...routeStops.map((stop) =>
        stop.pickupTime ? `${stop.name} at ${stop.pickupTime}` : stop.name,
      ),
    ],
    ctaLabel: "Book Seat",
    contactInfo: "Message via Sat Thwal to reserve your seat with this driver.",
    routeStops,
    vehicleType: route.vehicle_type,
    availableSeats: route.available_seats,
    totalSeats: route.total_seats,
  };
}

export { formatTime };
