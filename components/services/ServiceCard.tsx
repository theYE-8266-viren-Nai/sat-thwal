"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Users, BookOpen, Utensils, Bus, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/services/VerifiedBadge";
import { usePredictivePrefetch } from "@/lib/hooks/usePredictivePrefetch";
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
  preloadImage?: boolean;
  showCta?: boolean;
}

export function ServiceCard({ data, preloadImage = false, showCta = true }: ServiceCardProps) {
  const category = CATEGORIES[data.category];
  const prefetch = usePredictivePrefetch(data);

  return (
    <Link
      href={data.href}
      className="block h-full min-h-11"
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-lg border-border py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {data.image ? (
            <Image
              src={data.image}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(max-width: 767px) 16rem, (max-width: 1023px) 33vw, 25vw"
              preload={preloadImage}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)` }}
            >
              <category.icon className="h-10 w-10" style={{ color: category.color }} />
            </div>
          )}
          {data.verified && <VerifiedBadge className="absolute left-2 top-2 bg-white/90" />}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{data.title}</h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">{data.subtitle}</p>

          <div className="flex flex-col gap-1 pt-0.5">
            {data.meta.slice(0, 3).map((item, i) => {
              const Icon = META_ICONS[item.icon];
              return (
                <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{item.label}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="min-w-0 truncate text-sm font-semibold text-foreground">{data.priceLabel}</span>
            {showCta && (
              <Badge
                className="h-7 shrink-0 rounded-full px-2.5 text-[0.7rem] font-semibold text-white"
                style={{ backgroundColor: category.color }}
              >
                {data.ctaLabel}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
