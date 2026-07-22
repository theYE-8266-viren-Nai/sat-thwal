import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { ServiceDetailData } from "@/types/detail";

export function ProviderInfo({ data }: { data: ServiceDetailData }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 md:px-8">
      <Avatar className="h-11 w-11">
        {data.providerAvatar && <AvatarImage src={data.providerAvatar} alt={data.providerName} />}
        <AvatarFallback>
          {data.providerAvatar === null && data.providerName ? (
            initials(data.providerName)
          ) : (
            <User className="h-5 w-5" />
          )}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-semibold text-foreground">{data.providerName}</p>
        <p className="text-xs text-muted-foreground">Service provider</p>
      </div>
    </div>
  );
}
