import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/services/VerifiedBadge";
import { CATEGORIES } from "@/lib/constants/categories";
import type { ServiceDetailData } from "@/types/detail";

export function ServiceDetailHeader({ data }: { data: ServiceDetailData }) {
  const category = CATEGORIES[data.category];

  return (
    <div>
      <div className="relative aspect-[16/8] w-full bg-muted md:aspect-[21/7]">
        {data.image ? (
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover"
            sizes="(max-width: 767px) 100vw, calc(100vw - 16rem)"
            preload
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `color-mix(in srgb, ${category.color} 15%, white)` }}
          >
            <category.icon className="h-12 w-12" style={{ color: category.color }} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-4 pt-3 md:px-6">
        <Badge className="h-6 w-fit rounded-full px-2 text-[0.7rem] font-semibold text-white" style={{ backgroundColor: category.color }}>
          {category.singularLabel}
        </Badge>
        <h1 className="text-lg font-semibold text-foreground md:text-xl">{data.title}</h1>
        {data.verified && <VerifiedBadge />}
      </div>
    </div>
  );
}
