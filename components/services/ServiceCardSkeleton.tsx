import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-border py-0 shadow-sm">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="mt-2 h-6 w-full" />
      </div>
    </Card>
  );
}

export function ServiceCardCompactSkeleton() {
  return (
    <Card className="flex flex-row items-center gap-4 overflow-hidden border-border p-4 shadow-sm">
      <Skeleton className="h-28 w-28 shrink-0 rounded-md sm:h-32 sm:w-32" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-4 w-14 shrink-0" />
    </Card>
  );
}

export function ServiceSectionSkeleton({ title }: { title: string }) {
  return (
    <section className="mt-7 px-5 md:px-8" aria-label={`${title} loading`}>
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-5 w-44" />
      </div>
      <div className="-mx-5 flex gap-4 overflow-x-hidden px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:px-0 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-64 shrink-0 md:w-auto">
            <ServiceCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
