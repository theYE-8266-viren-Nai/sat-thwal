"use client";

import { ServiceListingPage } from "@/components/services/ServiceListingPage";
import { getTutors, tutorToCard, type TutorRow } from "@/lib/queries/tutors";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { SUBJECTS } from "@/lib/constants/subjects";
import { formatMMK } from "@/lib/utils";
import type { FilterFieldConfig } from "@/types/domain";

const FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "subject", label: "Subject", type: "select", options: SUBJECTS.map((s) => ({ label: s, value: s })) },
  {
    key: "sessionMode",
    label: "Online or in-person",
    type: "select",
    options: [
      { label: "Online", value: "online" },
      { label: "In-person", value: "in_person" },
      { label: "Both", value: "both" },
    ],
  },
  { key: "township", label: "Township", type: "select", options: TOWNSHIPS.map((t) => ({ label: t, value: t })) },
  {
    key: "rating",
    label: "Minimum rating",
    type: "select",
    options: [
      { label: "4.5+", value: "4.5" },
      { label: "4.0+", value: "4.0" },
    ],
  },
  {
    key: "availability",
    label: "Availability",
    type: "select",
    options: [
      { label: "Weekdays", value: "weekday" },
      { label: "Weekends", value: "weekend" },
    ],
  },
  { key: "price", label: "Price per session (MMK)", type: "range", min: 0, max: 12000, step: 500 },
];

export default function TutorsPage() {
  return (
    <ServiceListingPage<TutorRow>
      title="Find a Tutor"
      searchPlaceholder="Search tutors, subjects..."
      filterFields={FILTER_FIELDS}
      formatRangeValue={formatMMK}
      fetchRows={getTutors}
      toCard={tutorToCard}
      matchesSearch={(row, query) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          row.name.toLowerCase().includes(q) ||
          row.subjects.some((s) => s.toLowerCase().includes(q))
        );
      }}
      applyFilters={(row, filters) => {
        if (filters.subject && !row.subjects.includes(filters.subject as string)) return false;
        if (filters.sessionMode) {
          const fv = filters.sessionMode as string;
          if (row.session_mode !== "both" && row.session_mode !== fv) return false;
        }
        if (filters.township && row.township !== filters.township) return false;
        if (filters.rating && row.rating < Number(filters.rating)) return false;
        if (filters.availability) {
          const fv = (filters.availability as string).toLowerCase();
          if (!row.availability_note?.toLowerCase().includes(fv)) return false;
        }
        if (filters.price) {
          const [lo, hi] = filters.price as [number, number];
          if (row.price_per_session < lo || row.price_per_session > hi) return false;
        }
        return true;
      }}
      emptyMessage="No tutors match your filters yet. Try widening your search."
    />
  );
}
