import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/services/VerifiedBadge";
import { RatingStars } from "@/components/services/RatingStars";
import { CATEGORIES } from "@/lib/constants/categories";
import type { ServiceDetailData } from "@/types/detail";

export function ServiceDetailHeader({ data }: { data: ServiceDetailData }) {
  const category = CATEGORIES[data.category];

  return (
    <div>
      <div className="relative aspect-[16/10] w-full bg-muted md:aspect-[21/9]">
        {data.image ? (
          <Image src={data.image} alt={data.title} fill className="object-cover" unoptimized />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)` }}
          >
            <category.icon className="h-16 w-16" style={{ color: category.color }} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 px-5 pt-4 md:px-8">
        <Badge className="w-fit px-2.5 text-xs font-semibold text-white" style={{ backgroundColor: category.color }}>
          {category.singularLabel}
        </Badge>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{data.title}</h1>
          {typeof data.rating === "number" && (
            <RatingStars rating={data.rating} reviewCount={data.reviewCount} />
          )}
        </div>
        {data.verified && <VerifiedBadge />}
      </div>
    </div>
  );
}
