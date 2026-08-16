"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, CalendarDays, Check, CheckCircle2, Clock3, MessageSquare, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  confirmFoodPackageRequest,
  confirmHostelRequest,
  markRequestProvided,
  updateRequestStatus,
} from "@/lib/queries/requests";
import { AcceptedRequestContactCard } from "@/components/requests/AcceptedRequestContactCard";
import { getIncomingRequestItems, type IncomingRequestItem, type IncomingRequestScope } from "@/lib/serviceFlowData";
import { queryKeys } from "@/lib/queryKeys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLES } from "@/lib/constants/requestStatus";
import type { Database } from "@/types/database.types";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";
}

function formatRequestDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}
interface IncomingRequestsListProps {
  requests: RequestRow[];
  requesterNames: Record<string, string>;
  scopeKey: string;
  scope: IncomingRequestScope;
}

const COPY_BY_SERVICE = {
  tutor: {
    pendingDescription: "Pending students waiting for your response.",
    acceptedDescription: "Students you have already accepted.",
    completedDescription: "Cases closed by student, system, or school admin.",
    studentReportedProblem: "Student reported a problem",
    awaitingStudent: "Awaiting student response",
    studentCompletedFirst: "Student confirmed receipt. Mark support as provided.",
    markProvided: "Mark as provided",
    providedSuccess: "Support marked as provided.",
    providedError: "Couldn't mark support as provided. Try again.",
    completedTitle: "Resolved support case",
  },
  hostel: {
    pendingDescription: "Pending students waiting for your response.",
    acceptedDescription: "Residents you have already accepted.",
    completedDescription: "Stays closed by resident, system, or school admin.",
    studentReportedProblem: "Resident reported a problem",
    awaitingStudent: "Awaiting resident response",
    studentCompletedFirst: "Resident confirmed the stay. Mark the room as provided.",
    markProvided: "Mark room as provided",
    providedSuccess: "Room marked as provided.",
    providedError: "Couldn't mark the room as provided. Try again.",
    completedTitle: "Resolved hostel stay",
  },
  food: {
    pendingDescription: "Pending students waiting for your response.",
    acceptedDescription: "Students you have already accepted.",
    completedDescription: "Cases closed by student, system, or school admin.",
    studentReportedProblem: "Student reported a problem",
    awaitingStudent: "Awaiting student response",
    studentCompletedFirst: "Student confirmed receipt. Mark support as provided.",
    markProvided: "Mark as provided",
    providedSuccess: "Support marked as provided.",
    providedError: "Couldn't mark support as provided. Try again.",
    completedTitle: "Resolved support case",
  },
  transportation: {
    pendingDescription: "Pending students waiting for your response.",
    acceptedDescription: "Students you have already accepted.",
    completedDescription: "Cases closed by student, system, or school admin.",
    studentReportedProblem: "Student reported a problem",
    awaitingStudent: "Awaiting student response",
    studentCompletedFirst: "Student confirmed receipt. Mark support as provided.",
    markProvided: "Mark as provided",
    providedSuccess: "Support marked as provided.",
    providedError: "Couldn't mark support as provided. Try again.",
    completedTitle: "Resolved support case",
  },
} satisfies Record<IncomingRequestScope["serviceType"], Record<string, string>>;
export function IncomingRequestsList({ requests, requesterNames, scopeKey, scope }: IncomingRequestsListProps) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.incomingRequests(scopeKey);
  const copy = COPY_BY_SERVICE[scope.serviceType];
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
      const message = getErrorMessage(error, "Couldn't update the request. Try again.");
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
      toast.error(copy.providedError);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<IncomingRequestItem[]>(queryKey, (current = []) =>
        current.map((item) => (item.request.id === updated.id ? { ...item, request: updated } : item)),
      );
      toast.success(copy.providedSuccess);
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
        className="content-visibility-list-item flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-indigo/10 font-semibold text-brand-indigo">
              {requesterName.trim() ? getInitials(requesterName) : <UserRound className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold text-foreground">{requesterName}</p>
                <Badge className={cn("shrink-0 rounded-full px-2.5 text-xs font-semibold", REQUEST_STATUS_STYLES[request.status])}>
                  {REQUEST_STATUS_LABEL[request.status]}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Requested {formatRequestDate(request.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {request.note && (
          <div className="flex gap-2 rounded-xl bg-secondary/45 px-3 py-2 text-sm text-muted-foreground">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" />
            <p className="line-clamp-3">{request.note}</p>
          </div>
        )}
        <AcceptedRequestContactCard
          requestId={request.id}
          serviceType={request.service_type}
          status={request.status}
          viewer="provider"
        />

        {request.status === "pending" && (
          <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:justify-end">
            <Button
              size="touch"
              className="rounded-xl bg-brand-mint px-5 text-white hover:bg-brand-mint/90 sm:min-w-36"
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
              className="rounded-xl px-5 sm:min-w-36"
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
                  <p className="text-sm font-medium text-foreground">{copy.studentReportedProblem}</p>
                  <p className="mt-1 text-sm text-muted-foreground">School admin review is needed.</p>
                </div>
              </div>
            ) : waitingForStudent ? (
              <div className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-indigo" />
                <p className="text-sm text-muted-foreground">
                  {copy.awaitingStudent}
                  {autoResolveDateLabel ? `. Auto-resolves after ${autoResolveDateLabel}` : "."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {studentCompletedFirst && (
                  <p className="text-sm text-muted-foreground">{copy.studentCompletedFirst}</p>
                )}
                <Button
                  size="touch"
                  className="rounded-xl bg-brand-mint text-white hover:bg-brand-mint/90"
                  disabled={respondMutation.isPending || providedMutation.isPending}
                  aria-busy={providedMutation.isPending && providedMutation.variables === request.id}
                  onClick={() => providedMutation.mutate(request.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {copy.markProvided}
                </Button>
              </div>
            )}
          </div>
        )}

        {request.status === "completed" && (
          <div className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-sm font-medium text-foreground">{copy.completedTitle}</p>
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
          <p className="text-sm text-muted-foreground">{copy.pendingDescription}</p>
        </div>
        {pendingRequests.length > 0
          ? pendingRequests.map((item) => renderRequestCard(item))
          : renderEmpty("No pending requests right now.")}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Accepted requests</h2>
          <p className="text-sm text-muted-foreground">{copy.acceptedDescription}</p>
        </div>
        {acceptedRequests.length > 0
          ? acceptedRequests.map((item) => renderRequestCard(item))
          : renderEmpty("No accepted requests yet.")}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Resolved requests</h2>
          <p className="text-sm text-muted-foreground">{copy.completedDescription}</p>
        </div>
        {completedRequests.length > 0
          ? completedRequests.map((item) => renderRequestCard(item))
          : renderEmpty("No resolved requests yet.")}
      </section>
    </div>
  );
}
