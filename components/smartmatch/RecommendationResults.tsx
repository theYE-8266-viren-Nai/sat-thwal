import { AIAvatar } from "@/components/smartmatch/AIAvatar";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { ServiceCardData } from "@/types/domain";

interface RecommendationResultsProps {
  query: string;
  results: ServiceCardData[];
}

export function RecommendationResults({ query, results }: RecommendationResultsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <AIAvatar className="h-9 w-9 shrink-0" />
        <p className="text-sm text-foreground">
          Here&apos;s what I found for &ldquo;{query}&rdquo; - picks matched to your budget,
          location, and preferences.
        </p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          No matches found yet. Try a different subject, township, or budget.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <ServiceCard key={`${item.category}-${item.id}`} data={item} />
          ))}
        </div>
      )}
    </div>
  );
}
