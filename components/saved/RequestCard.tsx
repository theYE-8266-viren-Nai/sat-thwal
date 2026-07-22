import { ServiceCard } from "@/components/services/ServiceCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";

const STATUS_STYLES: Record<RequestStatus, string> = {
  pending: "bg-brand-orange/15 text-orange-700",
  confirmed: "bg-brand-mint/15 text-emerald-700",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface RequestCardProps {
  data: ServiceCardData;
  status: RequestStatus;
  profileId: string;
  initialSaved: boolean;
}

export function RequestCard({ data, status, profileId, initialSaved }: RequestCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <Badge className={cn("w-fit px-2.5 text-xs font-semibold", STATUS_STYLES[status])}>
        {STATUS_LABEL[status]}
      </Badge>
      <ServiceCard data={data} profileId={profileId} initialSaved={initialSaved} />
    </div>
  );
}
