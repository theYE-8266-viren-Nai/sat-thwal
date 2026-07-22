import Link from "next/link";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { ServiceCardData } from "@/types/domain";

interface ServiceSectionProps {
  title: string;
  seeAllHref?: string;
  items: ServiceCardData[];
  profileId: string;
  savedKeys: Set<string>;
  emptyLabel?: string;
}

export function ServiceSection({
  title,
  seeAllHref,
  items,
  profileId,
  savedKeys,
  emptyLabel,
}: ServiceSectionProps) {
  if (items.length === 0 && !emptyLabel) return null;

  return (
    <section className="mt-7 px-5 md:px-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-sm font-medium text-brand-indigo hover:underline">
            See all
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4">
          {items.map((item) => (
            <div key={`${item.category}-${item.id}`} className="w-64 shrink-0 md:w-auto">
              <ServiceCard
                data={item}
                profileId={profileId}
                initialSaved={savedKeys.has(`${item.category}:${item.id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
