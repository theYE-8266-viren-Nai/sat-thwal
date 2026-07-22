import { cn } from "@/lib/utils";
import type { RouteStop } from "@/types/domain";

interface RouteTimelineProps {
  stops: RouteStop[];
  compact?: boolean;
}

export function RouteTimeline({ stops, compact = false }: RouteTimelineProps) {
  if (stops.length === 0) return null;

  return (
    <div aria-label="Ordered pickup stops">
      <div className="hidden items-start gap-0 sm:flex">
        {stops.map((stop, index) => (
          <div key={stop.id} className="flex min-w-0 flex-1 items-start">
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <span className="h-3 w-3 rounded-full bg-category-transport ring-4 ring-emerald-50" />
              <span
                className={cn(
                  "mt-2 max-w-full truncate font-medium text-foreground",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                {stop.name}
              </span>
              {stop.pickupTime && (
                <span className="mt-1 text-xs text-muted-foreground">{stop.pickupTime}</span>
              )}
            </div>
            {index < stops.length - 1 && (
              <div className="mt-1.5 h-px min-w-5 flex-1 bg-border" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:hidden">
        {stops.map((stop, index) => (
          <div key={stop.id} className="grid grid-cols-[1rem_1fr] gap-3">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-3 w-3 rounded-full bg-category-transport ring-4 ring-emerald-50" />
              {index < stops.length - 1 && <span className="h-9 w-px bg-border" aria-hidden="true" />}
            </div>
            <div className={cn("min-w-0", index < stops.length - 1 ? "pb-3" : "pb-0")}>
              <p className="text-sm font-medium text-foreground">{stop.name}</p>
              {stop.pickupTime && <p className="text-xs text-muted-foreground">{stop.pickupTime}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
