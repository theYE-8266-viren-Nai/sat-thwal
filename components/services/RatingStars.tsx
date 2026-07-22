import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
}

export function RatingStars({ rating, reviewCount }: RatingStarsProps) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
      <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
      {rating.toFixed(1)}
      {typeof reviewCount === "number" && (
        <span className="font-normal text-muted-foreground">({reviewCount})</span>
      )}
    </span>
  );
}
