import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand-mint/15 px-2 py-0.5 text-xs font-medium text-emerald-700",
        className,
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      Verified
    </span>
  );
}
