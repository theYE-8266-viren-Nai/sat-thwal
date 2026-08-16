"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { confirmRequestReceived, disputeRequest } from "@/lib/queries/requests";
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
  studentDisputedAt?: string | null;
  studentDisputeReason?: string | null;
  autoResolveAt?: string | null;
  resolutionSource?: RequestRow["resolution_source"];
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
  studentDisputedAt = null,
  studentDisputeReason = null,
  autoResolveAt = null,
  resolutionSource = null,
  onRequestChange,
}: RequestCardProps) {
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const queryClient = useQueryClient();
  const hasDispute = Boolean(studentDisputedAt);
  const canConfirmReceived =
    status === "confirmed" &&
    Boolean(ownerCompletedAt) &&
    !requesterCompletedAt &&
    !completedAt &&
    !hasDispute;
  const waitingForProvider =
    status === "confirmed" && !ownerCompletedAt && !requesterCompletedAt && !hasDispute;
  const autoResolveDateLabel = autoResolveAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(autoResolveAt))
    : null;
  const completedDateLabel = completedAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(completedAt))
    : null;
  const resolutionLabel =
    resolutionSource === "auto_resolved"
      ? "Auto-resolved after review window"
      : resolutionSource === "admin_resolved"
        ? "Resolved by school admin"
        : "Student confirmed support received";

  const confirmMutation = useMutation({
    mutationFn: () => confirmRequestReceived(createClient(), requestId),
    onMutate: async () => {
      const key = queryKeys.savedRequests(profileId);
      const requestsKey = queryKeys.profileRequests(profileId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: key }),
        queryClient.cancelQueries({ queryKey: requestsKey }),
      ]);
      const previous = queryClient.getQueryData<SavedRequestItem[]>(key);
      const previousRequests = queryClient.getQueryData<RequestRow[]>(requestsKey);
      const now = new Date().toISOString();
      let optimisticRequest: RequestRow | null = null;

      queryClient.setQueryData<SavedRequestItem[]>(key, (current = []) =>
        current.map((item) => {
          if (item.request.id !== requestId) return item;
          optimisticRequest = {
            ...item.request,
            status: "completed",
            requester_completed_at: now,
            completed_at: now,
            resolution_source: "student_confirmed",
            updated_at: now,
          };
          return { ...item, request: optimisticRequest };
        }),
      );

      if (optimisticRequest) onRequestChange?.(optimisticRequest);
      if (optimisticRequest) {
        queryClient.setQueryData<RequestRow[]>(requestsKey, (current = []) =>
          current.map((request) => (request.id === requestId ? optimisticRequest as RequestRow : request)),
        );
      }
      return { previous, previousRequests };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.savedRequests(profileId), context.previous);
        const restored = context.previous.find((item) => item.request.id === requestId)?.request;
        if (restored) onRequestChange?.(restored);
      }
      if (context?.previousRequests) {
        queryClient.setQueryData(queryKeys.profileRequests(profileId), context.previousRequests);
      }
      toast.error("Couldn't confirm support received. Try again.");
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<SavedRequestItem[]>(queryKeys.savedRequests(profileId), (current = []) =>
        current.map((item) => (item.request.id === requestId ? { ...item, request: updated } : item)),
      );
      queryClient.setQueryData<RequestRow[]>(queryKeys.profileRequests(profileId), (current = []) =>
        current.map((request) => (request.id === requestId ? updated : request)),
      );
      onRequestChange?.(updated);
      toast.success("Support receipt confirmed.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedRequests(profileId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileRequests(profileId) });
    },
  });

  const disputeMutation = useMutation({
    mutationFn: () => disputeRequest(createClient(), requestId, disputeReason),
    onMutate: async () => {
      const key = queryKeys.savedRequests(profileId);
      const requestsKey = queryKeys.profileRequests(profileId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: key }),
        queryClient.cancelQueries({ queryKey: requestsKey }),
      ]);
      const previous = queryClient.getQueryData<SavedRequestItem[]>(key);
      const previousRequests = queryClient.getQueryData<RequestRow[]>(requestsKey);
      const now = new Date().toISOString();
      let optimisticRequest: RequestRow | null = null;

      queryClient.setQueryData<SavedRequestItem[]>(key, (current = []) =>
        current.map((item) => {
          if (item.request.id !== requestId) return item;
          optimisticRequest = {
            ...item.request,
            student_disputed_at: now,
            student_dispute_reason: disputeReason.trim() || "Student reported a problem.",
            updated_at: now,
          };
          return { ...item, request: optimisticRequest };
        }),
      );

      if (optimisticRequest) onRequestChange?.(optimisticRequest);
      if (optimisticRequest) {
        queryClient.setQueryData<RequestRow[]>(requestsKey, (current = []) =>
          current.map((request) => (request.id === requestId ? optimisticRequest as RequestRow : request)),
        );
      }
      return { previous, previousRequests };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.savedRequests(profileId), context.previous);
        const restored = context.previous.find((item) => item.request.id === requestId)?.request;
        if (restored) onRequestChange?.(restored);
      }
      if (context?.previousRequests) {
        queryClient.setQueryData(queryKeys.profileRequests(profileId), context.previousRequests);
      }
      const message = error instanceof Error ? error.message : "Couldn't report this problem. Try again.";
      toast.error(message);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<SavedRequestItem[]>(queryKeys.savedRequests(profileId), (current = []) =>
        current.map((item) => (item.request.id === requestId ? { ...item, request: updated } : item)),
      );
      queryClient.setQueryData<RequestRow[]>(queryKeys.profileRequests(profileId), (current = []) =>
        current.map((request) => (request.id === requestId ? updated : request)),
      );
      onRequestChange?.(updated);
      setDisputeOpen(false);
      setDisputeReason("");
      toast.success("Problem reported for school review.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedRequests(profileId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profileRequests(profileId) });
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
          <p className="text-sm font-medium text-foreground">Resolved support case</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2.5 py-1">Support provided</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">{resolutionLabel}</span>
          </div>
          {completedDateLabel && (
            <p className="mt-2 text-sm text-muted-foreground">Resolved on {completedDateLabel}</p>
          )}
        </div>
      )}
      <ServiceCard data={data} />
      {status === "confirmed" && (canConfirmReceived || waitingForProvider || hasDispute) && (
        <div className="rounded-xl border border-border bg-card p-3">
          {hasDispute ? (
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Problem reported</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  School admin review is needed before this case is resolved.
                </p>
                {studentDisputeReason && (
                  <p className="mt-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
                    {studentDisputeReason}
                  </p>
                )}
              </div>
            </div>
          ) : waitingForProvider ? (
            <div className="flex items-start gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-indigo" />
              <p className="text-sm text-muted-foreground">
                Accepted. Waiting for provider to mark support as provided.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Provider marked support as provided. Confirm receipt or report a problem
                {autoResolveDateLabel ? ` before ${autoResolveDateLabel}` : ""}.
              </p>
              <Button
                size="touch"
                className="rounded-xl bg-brand-mint text-white hover:bg-brand-mint/90"
                disabled={confirmMutation.isPending || disputeMutation.isPending}
                aria-busy={confirmMutation.isPending}
                onClick={() => confirmMutation.mutate()}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm received
              </Button>
              <Button
                variant="outline"
                size="touch"
                className="rounded-xl"
                disabled={confirmMutation.isPending || disputeMutation.isPending}
                onClick={() => setDisputeOpen(true)}
              >
                <AlertCircle className="h-4 w-4" />
                Report a problem
              </Button>
            </div>
          )}
        </div>
      )}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report a problem</DialogTitle>
            <DialogDescription>
              Tell the school admin what went wrong with this support request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={disputeReason}
            onChange={(event) => setDisputeReason(event.target.value)}
            placeholder="Describe the issue clearly."
            minLength={8}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-mint text-white hover:bg-brand-mint/90"
              disabled={disputeMutation.isPending || disputeReason.trim().length < 8}
              aria-busy={disputeMutation.isPending}
              onClick={() => disputeMutation.mutate()}
            >
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
