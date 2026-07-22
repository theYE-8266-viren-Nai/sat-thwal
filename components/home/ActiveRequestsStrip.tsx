import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants/categories";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLES } from "@/lib/constants/requestStatus";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";

export interface ActiveRequestItem {
  requestId: string;
  status: RequestStatus;
  card: ServiceCardData;
}

interface ActiveRequestsStripProps {
  items: ActiveRequestItem[];
}

export function ActiveRequestsStrip({ items }: ActiveRequestsStripProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-7 px-5 md:px-8">
      <h2 className="mb-3 text-lg font-bold text-foreground">Your active requests</h2>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {items.map(({ requestId, status, card }) => {
          const category = CATEGORIES[card.category];
          const Icon = category.icon;
          return (
            <Link
              key={requestId}
              href={card.href}
              className="flex w-56 shrink-0 flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md md:w-64"
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)` }}
                >
                  <Icon className="h-4 w-4" style={{ color: category.color }} />
                </div>
                <Badge className={cn("px-2.5 text-xs font-semibold", REQUEST_STATUS_STYLES[status])}>
                  {REQUEST_STATUS_LABEL[status]}
                </Badge>
              </div>
              <p className="line-clamp-1 text-sm font-medium text-foreground">{card.title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{card.subtitle}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
