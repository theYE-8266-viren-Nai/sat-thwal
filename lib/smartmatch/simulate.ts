import type { TutorRow } from "@/lib/queries/tutors";
import type { HostelRow } from "@/lib/queries/hostels";
import type { FoodItem } from "@/lib/queries/food";
import type { TransportationRow } from "@/lib/queries/transportation";
import { tutorToCard } from "@/lib/queries/tutors";
import { hostelToCard } from "@/lib/queries/hostels";
import { foodToCard } from "@/lib/queries/food";
import { routeToCard } from "@/lib/queries/transportation";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { SUBJECTS } from "@/lib/constants/subjects";
import type { ServiceCardData, StudentProfile } from "@/types/domain";

export interface SmartMatchCatalog {
  tutors: TutorRow[];
  hostels: HostelRow[];
  foodItems: FoodItem[];
  routes: TransportationRow[];
}

function extractBudget(query: string): number | null {
  const match = query.match(/([\d,]{3,})\s*(mmk|kyat)?/i);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function extractTownship(query: string): string | null {
  const lower = query.toLowerCase();
  return TOWNSHIPS.find((township) => lower.includes(township.toLowerCase())) ?? null;
}

function extractSubject(query: string): string | null {
  const lower = query.toLowerCase();
  return SUBJECTS.find((subject) => lower.includes(subject.toLowerCase())) ?? null;
}

/**
 * Not real AI — a naive keyword match over the mock catalog, standing in for
 * SmartMatch AI until real matching logic replaces it.
 */
export async function simulateSmartMatch(
  query: string,
  catalog: SmartMatchCatalog,
  profile?: StudentProfile | null,
): Promise<ServiceCardData[]> {
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const budget = extractBudget(query) ?? profile?.budgetMax ?? null;
  const township = extractTownship(query) ?? profile?.township ?? null;
  const subject = extractSubject(query) ?? profile?.preferredSubjects?.[0] ?? null;

  const tutor =
    catalog.tutors.find((t) => subject && t.subjects.includes(subject)) ??
    catalog.tutors.find((t) => township && t.township === township) ??
    catalog.tutors[0];

  const hostel =
    catalog.hostels.find((h) => budget && h.monthly_rent <= budget) ??
    catalog.hostels.find((h) => township && h.township === township) ??
    catalog.hostels[0];

  const foodItem =
    catalog.foodItems.find((f) => township && f.restaurant.township === township) ??
    [...catalog.foodItems].sort((a, b) => a.meal.price - b.meal.price)[0];

  const route =
    catalog.routes.find((r) => township && r.pickup_township === township) ??
    catalog.routes[0];

  return [
    tutor && tutorToCard(tutor),
    hostel && hostelToCard(hostel),
    foodItem && foodToCard(foodItem),
    route && routeToCard(route),
  ].filter((card): card is ServiceCardData => Boolean(card));
}
