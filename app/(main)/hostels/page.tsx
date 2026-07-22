"use client";

import { ServiceListingPage } from "@/components/services/ServiceListingPage";
import { getHostels, hostelToCard, type HostelRow } from "@/lib/queries/hostels";
import { UNIVERSITIES } from "@/lib/constants/universities";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { HOSTEL_FACILITIES, HOSTEL_ROOM_TYPES } from "@/lib/constants/facilities";
import { formatMMK } from "@/lib/utils";
import type { FilterFieldConfig } from "@/types/domain";

const FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "university", label: "University", type: "select", options: UNIVERSITIES.map((u) => ({ label: u, value: u })) },
  { key: "budget", label: "Monthly budget (MMK)", type: "range", min: 0, max: 200000, step: 5000 },
  { key: "distance", label: "Distance from university (km)", type: "range", min: 0, max: 5, step: 0.5 },
  {
    key: "genderPolicy",
    label: "Male, female or mixed",
    type: "select",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Mixed", value: "mixed" },
    ],
  },
  { key: "roomType", label: "Room type", type: "select", options: HOSTEL_ROOM_TYPES.map((r) => ({ label: r, value: r })) },
  { key: "township", label: "Township", type: "select", options: TOWNSHIPS.map((t) => ({ label: t, value: t })) },
  { key: "facilities", label: "Facilities", type: "multiselect", options: HOSTEL_FACILITIES.map((f) => ({ label: f, value: f })) },
  { key: "mealsIncluded", label: "Meals included", type: "toggle" },
  { key: "availableOnly", label: "Rooms available now", type: "toggle" },
];

export default function HostelsPage() {
  return (
    <ServiceListingPage<HostelRow>
      title="Find a Hostel"
      searchPlaceholder="Search hostels, townships..."
      filterFields={FILTER_FIELDS}
      formatRangeValue={(n) => (n < 1000 ? `${n} km` : formatMMK(n))}
      fetchRows={getHostels}
      toCard={hostelToCard}
      matchesSearch={(row, query) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          row.name.toLowerCase().includes(q) ||
          row.university.toLowerCase().includes(q) ||
          row.township.toLowerCase().includes(q)
        );
      }}
      applyFilters={(row, filters) => {
        if (filters.university && row.university !== filters.university) return false;
        if (filters.budget) {
          const [lo, hi] = filters.budget as [number, number];
          if (row.monthly_rent < lo || row.monthly_rent > hi) return false;
        }
        if (filters.distance) {
          const [lo, hi] = filters.distance as [number, number];
          if (row.distance_km < lo || row.distance_km > hi) return false;
        }
        if (filters.genderPolicy && row.gender_policy !== filters.genderPolicy) return false;
        if (filters.roomType && row.room_type !== filters.roomType) return false;
        if (filters.township && row.township !== filters.township) return false;
        if (filters.facilities) {
          const required = filters.facilities as string[];
          if (!required.every((f) => row.facilities.includes(f))) return false;
        }
        if (filters.mealsIncluded && !row.meals_included) return false;
        if (filters.availableOnly && row.available_rooms <= 0) return false;
        return true;
      }}
      emptyMessage="No hostels match your filters yet. Try widening your search."
    />
  );
}
