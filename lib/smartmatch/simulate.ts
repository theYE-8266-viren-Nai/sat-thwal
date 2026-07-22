import type { TutorRow } from "@/lib/queries/tutors";
import type { HostelRow } from "@/lib/queries/hostels";
import { tutorToCard } from "@/lib/queries/tutors";
import { hostelToCard } from "@/lib/queries/hostels";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { SUBJECTS } from "@/lib/constants/subjects";
import type { ServiceCardData, StudentProfile } from "@/types/domain";

export interface SmartMatchCatalog {
  tutors: TutorRow[];
  hostels: HostelRow[];
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

// Detects when a query clearly asks for only one category, so the fallback
// doesn't force an irrelevant tutor/hostel pick just to always return a pair.
function extractCategoryIntent(query: string): { wantsTutor: boolean; wantsHostel: boolean } {
  const lower = query.toLowerCase();
  const mentionsHostel = HOSTEL_ONLY_KEYWORDS.some((word) => lower.includes(word));
  const mentionsTutor = TUTOR_ONLY_KEYWORDS.some((word) => lower.includes(word));

  if (mentionsHostel && !mentionsTutor) return { wantsTutor: false, wantsHostel: true };
  if (mentionsTutor && !mentionsHostel) return { wantsTutor: true, wantsHostel: false };
  return { wantsTutor: true, wantsHostel: true };
}

// Local fallback used when OpenRouter is unavailable or returns unusable IDs.
export function fallbackSmartMatch(
  query: string,
  catalog: SmartMatchCatalog,
  profile?: StudentProfile | null,
): ServiceCardData[] {
  const { wantsTutor, wantsHostel } = extractCategoryIntent(query);
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

  return [
    tutor && tutorToCard(tutor),
    hostel && hostelToCard(hostel),
  ].filter((card): card is ServiceCardData => Boolean(card));
}
