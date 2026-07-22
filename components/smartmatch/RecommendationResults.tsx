import { AIAvatar } from "@/components/smartmatch/AIAvatar";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { ServiceCardData } from "@/types/domain";

interface RecommendationResultsProps {
  query: string;
  results: ServiceCardData[];
  profileId: string;
  savedKeys: Set<string>;
}

export function RecommendationResults({ query, results, profileId, savedKeys }: RecommendationResultsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <AIAvatar className="h-9 w-9 shrink-0" />
        <p className="text-sm text-foreground">
          Here&apos;s what I found for &ldquo;{query}&rdquo; — one pick from each service, matched to
          your budget, location, and preferences.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {results.map((item) => (
          <ServiceCard
            key={`${item.category}-${item.id}`}
            data={item}
            profileId={profileId}
            initialSaved={savedKeys.has(`${item.category}:${item.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
