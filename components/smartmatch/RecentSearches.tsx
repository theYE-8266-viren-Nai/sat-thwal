import { History } from "lucide-react";

export function RecentSearches({
  searches,
  onSelect,
}: {
  searches: string[];
  onSelect: (query: string) => void;
}) {
  if (searches.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-muted-foreground">Recent searches</h3>
      <div className="flex flex-col gap-1.5">
        {searches.map((search) => (
          <button
            key={search}
            onClick={() => onSelect(search)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <History className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="line-clamp-1">{search}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
