import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile, profileToStudentProfile } from "@/lib/queries/profiles";
import { getTutors, tutorToCard, type TutorRow } from "@/lib/queries/tutors";
import { getHostels, hostelToCard, type HostelRow } from "@/lib/queries/hostels";
import { fallbackSmartMatch, type SmartMatchCatalog } from "@/lib/smartmatch/simulate";
import type { ServiceCardData, StudentProfile } from "@/types/domain";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3.1-flash-lite";
const MAX_RESULTS = 6;
const MAX_CATALOG_ITEMS = 40;

type RankedMatch = {
  category: "tutor" | "hostel";
  id: string;
  reason: string;
};

type OpenRouterMatchResponse = {
  results: RankedMatch[];
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ error: "Search query is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profileRow, tutors, hostels] = await Promise.all([
    getProfile(supabase, user.id),
    getTutors(supabase),
    getHostels(supabase),
  ]);
  const profile = profileRow ? profileToStudentProfile(profileRow) : null;
  const catalog = { tutors, hostels };

  const aiMatches = await getOpenRouterMatches(query, catalog, profile);
  const aiCards = aiMatches ? rankedMatchesToCards(aiMatches, catalog) : [];
  const useAiResults = aiCards.length > 0;

  return NextResponse.json(useAiResults ? aiCards : fallbackSmartMatch(query, catalog, profile), {
    headers: {
      "X-SmartMatch-Source": useAiResults ? "openrouter" : "fallback",
    },
  });
}

async function getOpenRouterMatches(
  query: string,
  catalog: SmartMatchCatalog,
  profile: StudentProfile | null,
): Promise<RankedMatch[] | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_key") return null;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-OpenRouter-Title": "Sat Thwal SmartMatch",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You rank student service listings for SmartMatch. Use only the provided tutor and hostel catalogs. Return only JSON that matches the schema. Never invent IDs.",
          },
          {
            role: "user",
            content: JSON.stringify({
              query,
              profile: safeProfile(profile),
              tutors: catalog.tutors.slice(0, MAX_CATALOG_ITEMS).map(safeTutor),
              hostels: catalog.hostels.slice(0, MAX_CATALOG_ITEMS).map(safeHostel),
              instructions:
                "Return the best tutor and hostel matches for the query, ranked by relevance. Include at most 6 total results.",
            }),
          },
        ],
        temperature: 0.2,
        max_tokens: 700,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "smartmatch_ranked_results",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                results: {
                  type: "array",
                  maxItems: MAX_RESULTS,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      category: { type: "string", enum: ["tutor", "hostel"] },
                      id: { type: "string" },
                      reason: { type: "string" },
                    },
                    required: ["category", "id", "reason"],
                  },
                },
              },
              required: ["results"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      console.warn("OpenRouter SmartMatch request failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = await response.json();
    const content = getMessageContent(data);
    if (!content) return null;

    const parsed = JSON.parse(content) as OpenRouterMatchResponse;
    if (!Array.isArray(parsed.results)) return null;

    return parsed.results.filter(isRankedMatch).slice(0, MAX_RESULTS);
  } catch {
    return null;
  }
}

function rankedMatchesToCards(
  matches: RankedMatch[],
  catalog: SmartMatchCatalog,
): ServiceCardData[] {
  const tutorsById = new Map(catalog.tutors.map((tutor) => [tutor.id, tutor]));
  const hostelsById = new Map(catalog.hostels.map((hostel) => [hostel.id, hostel]));
  const seen = new Set<string>();

  return matches
    .map((match) => {
      const key = `${match.category}:${match.id}`;
      if (seen.has(key)) return null;
      seen.add(key);

      if (match.category === "tutor") {
        const tutor = tutorsById.get(match.id);
        return tutor ? tutorToCard(tutor) : null;
      }

      const hostel = hostelsById.get(match.id);
      return hostel ? hostelToCard(hostel) : null;
    })
    .filter((card): card is ServiceCardData => Boolean(card));
}

function safeProfile(profile: StudentProfile | null) {
  if (!profile) return null;

  return {
    academicYear: profile.academicYear,
    township: profile.township,
    budgetMin: profile.budgetMin,
    budgetMax: profile.budgetMax,
    preferredSubjects: profile.preferredSubjects,
    languagePreference: profile.languagePreference,
  };
}

function safeTutor(tutor: TutorRow) {
  return {
    id: tutor.id,
    type: "tutor",
    name: tutor.name,
    subjects: tutor.subjects,
    township: tutor.township,
    bio: tutor.bio,
    rating: tutor.rating,
    reviewCount: tutor.review_count,
    pricePerSession: tutor.price_per_session,
    sessionMode: tutor.session_mode,
    availability: tutor.availability_note,
    verified: tutor.verified,
  };
}

function safeHostel(hostel: HostelRow) {
  return {
    id: hostel.id,
    type: "hostel",
    name: hostel.name,
    township: hostel.township,
    distanceKm: hostel.distance_km,
    monthlyRent: hostel.monthly_rent,
    genderPolicy: hostel.gender_policy,
    roomType: hostel.room_type,
    facilities: hostel.facilities,
    availableRooms: hostel.available_rooms,
    mealsIncluded: hostel.meals_included,
    description: hostel.description,
    verified: hostel.verified,
  };
}

function getMessageContent(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const choices = (data as { choices?: unknown }).choices;
  if (!Array.isArray(choices)) return null;
  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== "object") return null;
  const message = (firstChoice as { message?: unknown }).message;
  if (!message || typeof message !== "object") return null;
  const content = (message as { content?: unknown }).content;

  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return null;

  return content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const text = (part as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .join("");
}

function isRankedMatch(value: unknown): value is RankedMatch {
  if (!value || typeof value !== "object") return false;
  const match = value as Record<string, unknown>;
  return (
    (match.category === "tutor" || match.category === "hostel") &&
    typeof match.id === "string" &&
    typeof match.reason === "string"
  );
}
