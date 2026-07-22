import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants/categories";
import type { StudentOffer } from "@/lib/constants/offers";

export function OfferCard({ offer }: { offer: StudentOffer }) {
  const category = CATEGORIES[offer.category];

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm md:w-auto">
      <Badge className="w-fit gap-1 text-white" style={{ backgroundColor: "var(--brand-orange)" }}>
        <Tag className="h-3 w-3" />
        {offer.badge}
      </Badge>
      <h3 className="font-semibold text-foreground">{offer.title}</h3>
      <p className="text-sm text-muted-foreground">{offer.description}</p>
      <span className="text-xs font-medium" style={{ color: category.color }}>
        {category.singularLabel}
      </span>
    </div>
  );
}
