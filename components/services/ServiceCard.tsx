import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Users, BookOpen, Utensils, Bus, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/services/VerifiedBadge";
import { SaveButton } from "@/components/services/SaveButton";
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

interface ServiceCardProps {
  data: ServiceCardData;
  profileId: string;
  initialSaved: boolean;
  hideSaveButton?: boolean;
}

export function ServiceCard({ data, profileId, initialSaved, hideSaveButton = false }: ServiceCardProps) {
  const category = CATEGORIES[data.category];

  return (
    <Link href={data.href} className="block h-full">
      <Card className="flex h-full flex-col overflow-hidden border-border py-0 shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] w-full bg-muted">
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
          {!hideSaveButton && (
            <SaveButton
              profileId={profileId}
              category={data.category}
              serviceId={data.id}
              initialSaved={initialSaved}
              className="absolute right-2 top-2"
            />
          )}
          {data.verified && <VerifiedBadge className="absolute left-2 top-2 bg-white/90" />}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-1 font-semibold text-foreground">{data.title}</h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">{data.subtitle}</p>

          <div className="flex flex-col gap-1">
            {data.meta.map((item, i) => {
              const Icon = META_ICONS[item.icon];
              return (
                <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{item.label}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-semibold text-foreground">{data.priceLabel}</span>
            <Badge
              className="h-auto px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: category.color }}
            >
              {data.ctaLabel}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
