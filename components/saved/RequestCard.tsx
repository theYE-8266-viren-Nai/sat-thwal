"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { markRequestCompletedByRequester } from "@/lib/queries/requests";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { REQUEST_STATUS_STYLES, REQUEST_STATUS_LABEL } from "@/lib/constants/requestStatus";
import type { Database, RequestStatus } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";
import type { SavedRequestItem } from "@/lib/serviceFlowData";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

interface RequestCardProps {
  profileId: string;
  requestId: string;
  data: ServiceCardData;
  status: RequestStatus;
  note?: string | null;
  requesterCompletedAt?: string | null;
  ownerCompletedAt?: string | null;
  completedAt?: string | null;
  onRequestChange?: (request: RequestRow) => void;
}

export function RequestCard({
  profileId,
  requestId,
  data,
  status,
  note,
  requesterCompletedAt = null,
  ownerCompletedAt = null,
  completedAt = null,
  onRequestChange,
}: RequestCardProps) {
  const queryClient = useQueryClient();
  const canComplete =
    status === "confirmed" &&
    (data.category === "tutor" || data.category === "hostel" || data.category === "transportation") &&
    !requesterCompletedAt;
  const waitingForProvider = status === "confirmed" && requesterCompletedAt && !ownerCompletedAt;
  const providerCompletedFirst = status === "confirmed" && ownerCompletedAt && !requesterCompletedAt;
  const completedDateLabel = completedAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(completedAt))
    : null;
  const providerLabel =
    data.category === "tutor"
      ? "Tutor completed"
      : data.category === "transportation"
        ? "Driver completed"
        : "Provider completed";

  const completeMutation = useMutation({
    mutationFn: () => markRequestCompletedByRequester(createClient(), requestId),
    onMutate: async () => {
      const key = queryKeys.savedRequests(profileId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SavedRequestItem[]>(key);
      const now = new Date().toISOString();
      let optimisticRequest: RequestRow | null = null;

      queryClient.setQueryData<SavedRequestItem[]>(key, (current = []) =>
        current.map((item) => {
          if (item.request.id !== requestId) return item;
          optimisticRequest = {
            ...item.request,
            status: item.request.owner_completed_at ? "completed" : item.request.status,
            requester_completed_at: now,
            completed_at: item.request.owner_completed_at ? now : item.request.completed_at,
            updated_at: now,
          };
          return { ...item, request: optimisticRequest };
        }),
      );

      if (optimisticRequest) onRequestChange?.(optimisticRequest);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.savedRequests(profileId), context.previous);
        const restored = context.previous.find((item) => item.request.id === requestId)?.request;
        if (restored) onRequestChange?.(restored);
      }
      toast.error("Couldn't mark this request complete. Try again.");
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<SavedRequestItem[]>(queryKeys.savedRequests(profileId), (current = []) =>
        current.map((item) => (item.request.id === requestId ? { ...item, request: updated } : item)),
      );
      onRequestChange?.(updated);
      toast.success(updated.status === "completed" ? "Request completed" : "Completion marked");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedRequests(profileId) });
    },
  });

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
      {status === "completed" && (
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-sm font-medium text-foreground">Completed by both sides</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2.5 py-1">Student completed</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">{providerLabel}</span>
          </div>
          {completedDateLabel && (
            <p className="mt-2 text-sm text-muted-foreground">Completed on {completedDateLabel}</p>
          )}
        </div>
      )}
      <ServiceCard data={data} />
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
                disabled={completeMutation.isPending}
                aria-busy={completeMutation.isPending}
                onClick={() => completeMutation.mutate()}
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
