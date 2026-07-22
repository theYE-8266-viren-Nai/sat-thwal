import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-brand-indigo to-brand-indigo-dark text-white shadow-md",
        className,
      )}
    >
      <Sparkles className="h-1/2 w-1/2" />
    </div>
  );
}
