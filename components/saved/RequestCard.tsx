import { ServiceCard } from "@/components/services/ServiceCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { REQUEST_STATUS_STYLES, REQUEST_STATUS_LABEL } from "@/lib/constants/requestStatus";
import type { RequestStatus } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";

interface RequestCardProps {
  data: ServiceCardData;
  status: RequestStatus;
  note?: string | null;
  profileId: string;
  initialSaved: boolean;
}

export function RequestCard({ data, status, note, profileId, initialSaved }: RequestCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn("w-fit px-2.5 text-xs font-semibold", REQUEST_STATUS_STYLES[status])}>
          {REQUEST_STATUS_LABEL[status]}
        </Badge>
        {data.category === "transportation" && note && (
          <span className="text-xs text-muted-foreground">{note}</span>
        )}
      </div>
      <ServiceCard data={data} profileId={profileId} initialSaved={initialSaved} />
    </div>
  );
}
