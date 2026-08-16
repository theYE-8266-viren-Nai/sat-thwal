import Link from "next/link";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { ServiceCardData } from "@/types/domain";

interface ServiceSectionProps {
  title: string;
  seeAllHref?: string;
  items: ServiceCardData[];
  emptyLabel?: string;
  preloadFirstImage?: boolean;
}

export function ServiceSection({
  title,
  seeAllHref,
  items,
  emptyLabel,
  preloadFirstImage = false,
}: ServiceSectionProps) {
  if (items.length === 0 && !emptyLabel) return null;

  return (
    <section className="mt-5 px-4 md:px-6">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-sm font-medium text-brand-indigo hover:underline">
            View all
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 xl:grid-cols-4">
          {items.map((item, index) => (
            <div key={`${item.category}-${item.id}`} className="w-60 shrink-0 md:w-auto">
              <ServiceCard data={item} preloadImage={preloadFirstImage && index === 0} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
