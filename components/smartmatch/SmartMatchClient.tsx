"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSavedItems } from "@/lib/queries/savedItems";
import { getRecentSearches, addRecentSearch } from "@/lib/recentlyViewed";
import { AIAvatar } from "@/components/smartmatch/AIAvatar";
import { ChatInput } from "@/components/smartmatch/ChatInput";
import { SuggestedPrompts } from "@/components/smartmatch/SuggestedPrompts";
import { RecentSearches } from "@/components/smartmatch/RecentSearches";
import { LoadingIndicator } from "@/components/smartmatch/LoadingIndicator";
import { RecommendationResults } from "@/components/smartmatch/RecommendationResults";
import type { ServiceCardData } from "@/types/domain";

type Status = "idle" | "loading" | "results" | "error";

export function SmartMatchClient() {
  const searchParams = useSearchParams();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ServiceCardData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setRecentSearches(getRecentSearches());

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [saved] = await Promise.all([
        getSavedItems(supabase, user.id),
      ]);

      setProfileId(user.id);
      setSavedKeys(new Set(saved.map((s) => `${s.service_type}:${s.service_id}`)));

      const initialQuery = searchParams.get("q");
      if (initialQuery) {
        void handleSubmit(initialQuery);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(text: string) {
    setQuery(text);
    setStatus("loading");
    setError(null);
    addRecentSearch(text);
    setRecentSearches(getRecentSearches());

    try {
      const response = await fetch("/api/smartmatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok) {
        throw new Error("SmartMatch request failed");
      }

      const matches = (await response.json()) as ServiceCardData[];
      setResults(Array.isArray(matches) ? matches : []);
      setStatus("results");
    } catch {
      setResults([]);
      setError("SmartMatch couldn't analyze that request right now. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-6 pt-6 md:px-8">
      <div className="flex items-center gap-3">
        <AIAvatar className="h-12 w-12 shrink-0" />
        <div>
          <h1 className="text-xl font-bold text-foreground">What do you need help with today?</h1>
          <p className="text-sm text-muted-foreground">
            Tell SmartMatch AI what you&apos;re looking for across tutors and hostels.
          </p>
        </div>
      </div>

      <ChatInput onSubmit={(text) => handleSubmit(text)} disabled={!profileId || status === "loading"} />

      {status === "loading" && <LoadingIndicator />}

      {status === "results" && profileId && (
        <RecommendationResults query={query} results={results} profileId={profileId} savedKeys={savedKeys} />
      )}

      {status === "error" && error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
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
