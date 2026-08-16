"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, Check, CheckCircle2, Clock3, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  confirmFoodPackageRequest,
  confirmHostelRequest,
  markRequestProvided,
  updateRequestStatus,
} from "@/lib/queries/requests";
import { getIncomingRequestItems, type IncomingRequestItem, type IncomingRequestScope } from "@/lib/serviceFlowData";
import { queryKeys } from "@/lib/queryKeys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLES } from "@/lib/constants/requestStatus";
import type { Database } from "@/types/database.types";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

interface IncomingRequestsListProps {
  requests: RequestRow[];
  requesterNames: Record<string, string>;
  scopeKey: string;
  scope: IncomingRequestScope;
}

export function IncomingRequestsList({ requests, requesterNames, scopeKey, scope }: IncomingRequestsListProps) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.incomingRequests(scopeKey);
  const initialItems = useMemo(
    () =>
      requests.map((request) => ({
        request,
        requesterName: requesterNames[request.id] ?? "A student",
      })),
    [requesterNames, requests],
  );
  const incomingQuery = useQuery({
    queryKey,
    queryFn: () => getIncomingRequestItems(createClient(), scope),
    initialData: initialItems,
  });
  const items = incomingQuery.data ?? initialItems;
  const pendingRequests = items.filter((item) => item.request.status === "pending");
  const acceptedRequests = items.filter((item) => item.request.status === "confirmed");
  const completedRequests = items.filter((item) => item.request.status === "completed");

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: "confirmed" | "cancelled" }) => {
      const supabase = createClient();
      const request = items.find((item) => item.request.id === requestId)?.request;
      const updated =
        status === "confirmed" && request?.service_type === "food"
          ? await confirmFoodPackageRequest(supabase, requestId)
          : status === "confirmed" && request?.service_type === "hostel"
            ? await confirmHostelRequest(supabase, requestId)
          : null;
      if (!updated) await updateRequestStatus(supabase, requestId, status);
      return updated ?? (request ? { ...request, status, updated_at: new Date().toISOString() } : null);
    },
    onMutate: async ({ requestId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<IncomingRequestItem[]>(queryKey);
      const now = new Date().toISOString();

      queryClient.setQueryData<IncomingRequestItem[]>(queryKey, (current = []) =>
        current.map((item) =>
          item.request.id === requestId
            ? { ...item, request: { ...item.request, status, updated_at: now, seen_by_student: false } }
            : item,
        ),
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      const message = error instanceof Error ? error.message : "Couldn't update the request. Try again.";
      toast.error(message);
    },
    onSuccess: (updated, { status, requestId }) => {
      if (updated) {
        queryClient.setQueryData<IncomingRequestItem[]>(queryKey, (current = []) =>
          current.map((item) => (item.request.id === requestId ? { ...item, request: updated } : item)),
        );
      }
      toast.success(status === "confirmed" ? "Request accepted" : "Request declined");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const providedMutation = useMutation({
    mutationFn: (requestId: string) => markRequestProvided(createClient(), requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<IncomingRequestItem[]>(queryKey);
      const now = new Date().toISOString();

      queryClient.setQueryData<IncomingRequestItem[]>(queryKey, (current = []) =>
        current.map((item) => {
          if (item.request.id !== requestId) return item;
          const completed = Boolean(item.request.requester_completed_at);
          return {
            ...item,
            request: {
              ...item.request,
              status: completed ? "completed" : item.request.status,
              owner_completed_at: now,
              completed_at: completed ? now : item.request.completed_at,
              auto_resolve_at: completed
                ? item.request.auto_resolve_at
                : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: now,
            },
          };
        }),
      );

      return { previous };
    },
    onError: (_error, _requestId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error("Couldn't mark support as provided. Try again.");
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<IncomingRequestItem[]>(queryKey, (current = []) =>
        current.map((item) => (item.request.id === updated.id ? { ...item, request: updated } : item)),
      );
      toast.success("Support marked as provided.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  function renderRequestCard({ request, requesterName }: IncomingRequestItem) {
    const hasDispute = Boolean(request.student_disputed_at);
    const canMarkProvided = request.status === "confirmed" && !request.owner_completed_at && !hasDispute;
    const waitingForStudent =
      request.status === "confirmed" && request.owner_completed_at && !request.requester_completed_at && !hasDispute;
    const studentCompletedFirst =
      request.status === "confirmed" && request.requester_completed_at && !request.owner_completed_at;
    const completedDateLabel = request.completed_at
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(request.completed_at))
      : null;
    const autoResolveDateLabel = request.auto_resolve_at
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(request.auto_resolve_at))
      : null;

    return (
      <div
        key={request.id}
        className="content-visibility-list-item flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">{requesterName}</p>
            {request.note && <p className="mt-1 text-sm text-muted-foreground">{request.note}</p>}
          </div>
          <Badge className={cn("shrink-0 px-2.5 text-xs font-semibold", REQUEST_STATUS_STYLES[request.status])}>
            {REQUEST_STATUS_LABEL[request.status]}
          </Badge>
        </div>

        {request.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="touch"
              className="flex-1 rounded-xl bg-brand-mint text-white hover:bg-brand-mint/90"
              disabled={respondMutation.isPending || providedMutation.isPending}
              aria-busy={respondMutation.isPending && respondMutation.variables?.requestId === request.id}
              onClick={() => respondMutation.mutate({ requestId: request.id, status: "confirmed" })}
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="touch"
              className="flex-1 rounded-xl"
              disabled={respondMutation.isPending || providedMutation.isPending}
              aria-busy={respondMutation.isPending && respondMutation.variables?.requestId === request.id}
              onClick={() => respondMutation.mutate({ requestId: request.id, status: "cancelled" })}
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
          </div>
        )}

        {request.status === "confirmed" && (canMarkProvided || waitingForStudent || studentCompletedFirst || hasDispute) && (
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            {hasDispute ? (
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-foreground">Student reported a problem</p>
                  <p className="mt-1 text-sm text-muted-foreground">School admin review is needed.</p>
                </div>
              </div>
            ) : waitingForStudent ? (
              <div className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-indigo" />
                <p className="text-sm text-muted-foreground">
                  Awaiting student response
                  {autoResolveDateLabel ? `. Auto-resolves after ${autoResolveDateLabel}` : "."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {studentCompletedFirst && (
                  <p className="text-sm text-muted-foreground">Student confirmed receipt. Mark support as provided.</p>
                )}
                <Button
                  size="touch"
                  className="rounded-xl bg-brand-mint text-white hover:bg-brand-mint/90"
                  disabled={respondMutation.isPending || providedMutation.isPending}
                  aria-busy={providedMutation.isPending && providedMutation.variables === request.id}
                  onClick={() => providedMutation.mutate(request.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as provided
                </Button>
              </div>
            )}
          </div>
        )}

        {request.status === "completed" && (
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-sm font-medium text-foreground">Resolved support case</p>
            {completedDateLabel && (
              <p className="mt-1 text-sm text-muted-foreground">Resolved on {completedDateLabel}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderEmpty(message: string) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        {message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-5 md:px-8">
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Incoming requests</h2>
          <p className="text-sm text-muted-foreground">Pending students waiting for your response.</p>
        </div>
        {pendingRequests.length > 0
          ? pendingRequests.map((item) => renderRequestCard(item))
          : renderEmpty("No pending requests right now.")}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Accepted requests</h2>
          <p className="text-sm text-muted-foreground">Students you have already accepted.</p>
        </div>
        {acceptedRequests.length > 0
          ? acceptedRequests.map((item) => renderRequestCard(item))
          : renderEmpty("No accepted requests yet.")}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Resolved requests</h2>
          <p className="text-sm text-muted-foreground">Cases closed by student, system, or school admin.</p>
        </div>
        {completedRequests.length > 0
          ? completedRequests.map((item) => renderRequestCard(item))
          : renderEmpty("No resolved requests yet.")}
      </section>
    </div>
  );
}
