"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProfile, profileToStudentProfile } from "@/lib/queries/profiles";
import { getTutors } from "@/lib/queries/tutors";
import { getHostels } from "@/lib/queries/hostels";
import { getFoodItems } from "@/lib/queries/food";
import { getRoutes } from "@/lib/queries/transportation";
import { getSavedItems } from "@/lib/queries/savedItems";
import { simulateSmartMatch, type SmartMatchCatalog } from "@/lib/smartmatch/simulate";
import { getRecentSearches, addRecentSearch } from "@/lib/recentlyViewed";
import { AIAvatar } from "@/components/smartmatch/AIAvatar";
import { ChatInput } from "@/components/smartmatch/ChatInput";
import { SuggestedPrompts } from "@/components/smartmatch/SuggestedPrompts";
import { RecentSearches } from "@/components/smartmatch/RecentSearches";
import { LoadingIndicator } from "@/components/smartmatch/LoadingIndicator";
import { RecommendationResults } from "@/components/smartmatch/RecommendationResults";
import type { ServiceCardData, StudentProfile } from "@/types/domain";

type Status = "idle" | "loading" | "results";

export function SmartMatchClient() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<SmartMatchCatalog | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ServiceCardData[]>([]);

  useEffect(() => {
    async function load() {
      setRecentSearches(getRecentSearches());

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRow, tutors, hostels, foodItems, routes, saved] = await Promise.all([
        getProfile(supabase, user.id),
        getTutors(supabase),
        getHostels(supabase),
        getFoodItems(supabase),
        getRoutes(supabase),
        getSavedItems(supabase, user.id),
      ]);

      setProfileId(user.id);
      if (profileRow) setProfile(profileToStudentProfile(profileRow));
      setCatalog({ tutors, hostels, foodItems, routes });
      setSavedKeys(new Set(saved.map((s) => `${s.service_type}:${s.service_id}`)));

      const initialQuery = searchParams.get("q");
      if (initialQuery) {
        void handleSubmit(initialQuery, { tutors, hostels, foodItems, routes }, profileRow ? profileToStudentProfile(profileRow) : null);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(
    text: string,
    catalogOverride?: SmartMatchCatalog,
    profileOverride?: StudentProfile | null,
  ) {
    const activeCatalog = catalogOverride ?? catalog;
    if (!activeCatalog) return;

    setQuery(text);
    setStatus("loading");
    addRecentSearch(text);
    setRecentSearches(getRecentSearches());

    const matches = await simulateSmartMatch(text, activeCatalog, profileOverride ?? profile);
    setResults(matches);
    setStatus("results");
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-6 pt-6 md:px-8">
      <div className="flex items-center gap-3">
        <AIAvatar className="h-12 w-12 shrink-0" />
        <div>
          <h1 className="text-xl font-bold text-foreground">What do you need help with today?</h1>
          <p className="text-sm text-muted-foreground">
            Tell SmartMatch AI what you&apos;re looking for across tutors, hostels, food, and transportation.
          </p>
        </div>
      </div>

      <ChatInput onSubmit={(text) => handleSubmit(text)} disabled={!catalog || status === "loading"} />

      {status === "loading" && <LoadingIndicator />}

      {status === "results" && profileId && (
        <RecommendationResults query={query} results={results} profileId={profileId} savedKeys={savedKeys} />
      )}

      {status === "idle" && (
        <div className="flex flex-col gap-6">
          <SuggestedPrompts onSelect={(prompt) => handleSubmit(prompt)} />
          <RecentSearches searches={recentSearches} onSelect={(search) => handleSubmit(search)} />
        </div>
      )}
    </div>
  );
}
