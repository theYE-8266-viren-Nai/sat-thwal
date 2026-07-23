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
  food: FoodItem[];
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

const HOSTEL_ONLY_KEYWORDS = ["room", "rooms", "hostel", "hostels", "dorm", "dormitory", "housing", "accommodation"];
const TUTOR_ONLY_KEYWORDS = ["tutor", "tutors", "tuition", "teacher", "teachers", "lesson", "lessons"];
const FOOD_ONLY_KEYWORDS = ["food", "meal", "meals", "eat", "restaurant", "restaurants", "lunch", "dinner", "breakfast"];
const TRANSPORT_ONLY_KEYWORDS = ["transportation", "transport", "bus", "van", "route", "commute", "seat"];

// Detects when a query clearly asks for only one category, so the fallback
// doesn't force irrelevant picks from the other categories just to always
// return a full set.
function extractCategoryIntent(query: string): {
  wantsTutor: boolean;
  wantsHostel: boolean;
  wantsFood: boolean;
  wantsTransportation: boolean;
} {
  const lower = query.toLowerCase();
  const mentions = {
    hostel: HOSTEL_ONLY_KEYWORDS.some((word) => lower.includes(word)),
    tutor: TUTOR_ONLY_KEYWORDS.some((word) => lower.includes(word)),
    food: FOOD_ONLY_KEYWORDS.some((word) => lower.includes(word)),
    transportation: TRANSPORT_ONLY_KEYWORDS.some((word) => lower.includes(word)),
  };
  const mentionedCount = Object.values(mentions).filter(Boolean).length;

  if (mentionedCount === 1) {
    return {
      wantsTutor: mentions.tutor,
      wantsHostel: mentions.hostel,
      wantsFood: mentions.food,
      wantsTransportation: mentions.transportation,
    };
  }

  return { wantsTutor: true, wantsHostel: true, wantsFood: true, wantsTransportation: true };
}

// Local fallback used when OpenRouter is unavailable or returns unusable IDs.
export function fallbackSmartMatch(
  query: string,
  catalog: SmartMatchCatalog,
  profile?: StudentProfile | null,
): ServiceCardData[] {
  const { wantsTutor, wantsHostel, wantsFood, wantsTransportation } = extractCategoryIntent(query);
  const budget = extractBudget(query) ?? profile?.budgetMax ?? null;
  const township = extractTownship(query) ?? profile?.township ?? null;
  const subject = extractSubject(query) ?? profile?.preferredSubjects?.[0] ?? null;

  const tutor = wantsTutor
    ? catalog.tutors.find((t) => subject && t.subjects.includes(subject)) ??
      catalog.tutors.find((t) => township && t.township === township) ??
      catalog.tutors[0]
    : null;

  const hostel = wantsHostel
    ? catalog.hostels.find((h) => budget && h.monthly_rent <= budget) ??
      catalog.hostels.find((h) => township && h.township === township) ??
      catalog.hostels[0]
    : null;

  const food = wantsFood
    ? catalog.food.find((f) => township && f.restaurant.township === township) ??
      catalog.food.find((f) => budget && f.meal.price <= budget) ??
      catalog.food[0]
    : null;

  const route = wantsTransportation
    ? catalog.routes.find((r) => township && r.pickup_township === township) ??
      catalog.routes.find((r) => budget && r.monthly_price <= budget) ??
      catalog.routes[0]
    : null;

  return [
    tutor && tutorToCard(tutor),
    hostel && hostelToCard(hostel),
    food && foodToCard(food),
    route && routeToCard(route),
  ].filter((card): card is ServiceCardData => Boolean(card));
}
