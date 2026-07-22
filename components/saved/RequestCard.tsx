"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { markRequestCompletedByRequester } from "@/lib/queries/requests";
import { cn } from "@/lib/utils";
import { REQUEST_STATUS_STYLES, REQUEST_STATUS_LABEL } from "@/lib/constants/requestStatus";
import type { Database, RequestStatus } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

interface RequestCardProps {
  requestId: string;
  data: ServiceCardData;
  status: RequestStatus;
  note?: string | null;
  profileId: string;
  initialSaved: boolean;
  hideSaveButton?: boolean;
  requesterCompletedAt?: string | null;
  ownerCompletedAt?: string | null;
  completedAt?: string | null;
  onRequestChange?: (request: RequestRow) => void;
}

export function RequestCard({
  requestId,
  data,
  status,
  note,
  profileId,
  initialSaved,
  hideSaveButton = false,
  requesterCompletedAt = null,
  ownerCompletedAt = null,
  completedAt = null,
  onRequestChange,
}: RequestCardProps) {
  const [submitting, setSubmitting] = useState(false);
  const canComplete =
    status === "confirmed" &&
    (data.category === "tutor" || data.category === "hostel") &&
    !requesterCompletedAt;
  const waitingForProvider = status === "confirmed" && requesterCompletedAt && !ownerCompletedAt;
  const providerCompletedFirst = status === "confirmed" && ownerCompletedAt && !requesterCompletedAt;
  const completedDateLabel = completedAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(completedAt))
    : null;

  async function handleComplete() {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const updated = await markRequestCompletedByRequester(supabase, requestId);
      onRequestChange?.(updated);
      toast.success(updated.status === "completed" ? "Request completed" : "Completion marked");
    } catch {
      toast.error("Couldn't mark this request complete. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
      <ServiceCard
        data={data}
        profileId={profileId}
        initialSaved={initialSaved}
        hideSaveButton={hideSaveButton}
      />
      {status === "confirmed" && (canComplete || waitingForProvider || providerCompletedFirst) && (
        <div className="rounded-xl border border-border bg-card p-3">
          {waitingForProvider ? (
            <p className="text-sm text-muted-foreground">Waiting for provider to confirm completion.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {providerCompletedFirst && (
                <p className="text-sm text-muted-foreground">Provider marked this complete.</p>
              )}
              <Button
                size="touch"
                className="rounded-xl bg-brand-mint text-white hover:bg-brand-mint/90"
                disabled={submitting}
                onClick={handleComplete}
              >
                <CheckCircle2 className="h-4 w-4" />
                {submitting ? "Completing..." : "Complete"}
              </Button>
            </div>
          )}
        </div>
      )}
      {status === "completed" && (
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-sm font-medium text-foreground">Completed by both sides</p>
          {completedDateLabel && (
            <p className="mt-1 text-sm text-muted-foreground">Completed on {completedDateLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
