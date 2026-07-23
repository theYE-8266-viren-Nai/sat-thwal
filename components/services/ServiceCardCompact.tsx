import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Users, BookOpen, Utensils, Bus, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants/categories";
import type { ServiceCardData, ServiceCardMeta } from "@/types/domain";

const META_ICONS: Record<ServiceCardMeta["icon"], typeof MapPin> = {
  "map-pin": MapPin,
  clock: Clock,
  users: Users,
  "book-open": BookOpen,
  utensils: Utensils,
  bus: Bus,
  wallet: Wallet,
};

interface ServiceCardCompactProps {
  data: ServiceCardData;
}

export function ServiceCardCompact({ data }: ServiceCardCompactProps) {
  const category = CATEGORIES[data.category];
  const [primaryMeta, secondaryMeta] = data.meta;

  return (
    <Link href={data.href} className="block">
      <Card className="flex flex-row items-center gap-4 overflow-hidden border-border p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-md bg-muted">
          {data.image ? (
            <Image src={data.image} alt={data.title} fill className="object-cover" unoptimized />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)` }}
            >
              <category.icon className="h-10 w-10" style={{ color: category.color }} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">{data.title}</h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">{data.subtitle}</p>
          {[primaryMeta, secondaryMeta].filter(Boolean).map((meta, i) => {
            const Icon = META_ICONS[(meta as ServiceCardMeta).icon];
            return (
              <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{(meta as ServiceCardMeta).label}</span>
              </span>
            );
          })}
          <span className="text-base font-semibold text-foreground">{data.priceLabel}</span>
        </div>
      </Card>
    </Link>
  );
}
