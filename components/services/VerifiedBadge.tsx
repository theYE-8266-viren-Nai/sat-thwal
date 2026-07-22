import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn("gap-1 bg-brand-mint/15 text-emerald-700 [&>svg]:size-3.5!", className)}>
      <BadgeCheck />
      Verified
    </Badge>
  );
}
