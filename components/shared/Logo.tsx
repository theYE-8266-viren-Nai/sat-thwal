import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-indigo text-white font-bold">
        S
      </div>
      <span className="text-lg font-bold text-foreground">
        Sat Thwal <span className="font-normal text-muted-foreground">| UniMate</span>
      </span>
    </div>
  );
}
