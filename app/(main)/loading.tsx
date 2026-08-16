import { ServiceCardSkeleton } from "@/components/services/ServiceCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainRouteLoading() {
  return (
    <div aria-label="Preparing page">
      <div className="px-5 pb-4 pt-6 md:px-8">
        <Skeleton className="h-7 w-44 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-32 rounded-lg" />
      </div>
      <div className="flex items-center gap-2 px-5 pb-4 md:px-8">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 px-5 sm:grid-cols-2 md:px-8 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ServiceCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
