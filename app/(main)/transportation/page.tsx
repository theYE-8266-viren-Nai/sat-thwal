"use client";

import { ServiceListingPage } from "@/components/services/ServiceListingPage";
import {
  getRouteStops,
  getRoutes,
  routeToCard,
  SAMPLE_UIT_ROUTES,
  type TransportationRow,
} from "@/lib/queries/transportation";
import { TransportationRouteCard } from "@/components/transportation/TransportationRouteCard";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { formatMMK } from "@/lib/utils";
import type { FilterFieldConfig } from "@/types/domain";

const ROUTE_NAMES = SAMPLE_UIT_ROUTES.map((route) => route.route_name);

const DESTINATIONS = ["UIT"];
const VEHICLE_TYPES = ["Van", "Bus", "Ferry + Van"];

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLabel(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

const FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "pickupTownship", label: "Pickup township", type: "select", options: TOWNSHIPS.map((t) => ({ label: t, value: t })) },
  { key: "destination", label: "Destination", type: "select", options: DESTINATIONS.map((d) => ({ label: d, value: d })) },
  { key: "route", label: "Route", type: "select", options: ROUTE_NAMES.map((r) => ({ label: r, value: r })) },
  { key: "vehicleType", label: "Vehicle type", type: "select", options: VEHICLE_TYPES.map((v) => ({ label: v, value: v })) },
  { key: "departureWindow", label: "Departure time", type: "range", min: 360, max: 660, step: 15 },
  { key: "monthlyPrice", label: "Monthly price (MMK)", type: "range", min: 0, max: 50000, step: 2000 },
  { key: "seatsAvailable", label: "Seats available now", type: "toggle" },
];

export default function TransportationPage() {
  return (
    <ServiceListingPage<TransportationRow>
      title="University Ferry"
      searchPlaceholder="Search routes, stops or townships..."
      filterFields={FILTER_FIELDS}
      formatRangeValue={(n) => (n >= 360 && n <= 660 ? minutesToLabel(n) : formatMMK(n))}
      fetchRows={getRoutes}
      toCard={routeToCard}
      renderCard={(card, profileId) => <TransportationRouteCard data={card} profileId={profileId} />}
      matchesSearch={(row, query) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        const stops = getRouteStops(row);
        return (
          row.route_name.toLowerCase().includes(q) ||
          row.pickup_township.toLowerCase().includes(q) ||
          stops.some((stop) => stop.name.toLowerCase().includes(q)) ||
          (row.vehicle_type?.toLowerCase().includes(q) ?? false) ||
          row.driver_name.toLowerCase().includes(q)
        );
      }}
      applyFilters={(row, filters) => {
        const stops = getRouteStops(row);
        if (
          filters.pickupTownship &&
          !stops.some((stop) => stop.name === filters.pickupTownship)
        ) {
          return false;
        }
        if (filters.destination && stops.at(-1)?.name !== filters.destination) return false;
        if (filters.route && row.route_name !== filters.route) return false;
        if (filters.vehicleType && row.vehicle_type !== filters.vehicleType) return false;
        if (filters.departureWindow) {
          const [lo, hi] = filters.departureWindow as [number, number];
          const minutes = timeToMinutes(row.departure_time);
          if (minutes < lo || minutes > hi) return false;
        }
        if (filters.monthlyPrice) {
          const [lo, hi] = filters.monthlyPrice as [number, number];
          if (row.monthly_price < lo || row.monthly_price > hi) return false;
        }
        if (filters.seatsAvailable && row.available_seats <= 0) return false;
        return true;
      }}
      emptyMessage="No routes match your filters yet. Try widening your search."
    />
  );
}
