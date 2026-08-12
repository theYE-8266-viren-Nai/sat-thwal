import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-lg border-border py-0 shadow-sm">
      <Skeleton className="aspect-[5/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-2 h-6 w-full" />
      </div>
    </Card>
  );
}

export function ServiceCardCompactSkeleton() {
  return (
    <Card className="flex flex-row items-center gap-3 overflow-hidden rounded-lg border-border p-3 shadow-sm">
      <Skeleton className="h-24 w-24 shrink-0 rounded-md sm:h-28 sm:w-28" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-4 w-14 shrink-0" />
    </Card>
  );
}
