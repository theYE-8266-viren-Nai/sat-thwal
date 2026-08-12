"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  confirmFoodPackageRequest,
  confirmHostelRequest,
  markRequestCompletedByOwner,
  updateRequestStatus,
} from "@/lib/queries/requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLES } from "@/lib/constants/requestStatus";
import type { Database } from "@/types/database.types";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

interface IncomingRequestsListProps {
  requests: RequestRow[];
  requesterNames: Record<string, string>;
}

export function IncomingRequestsList({ requests, requesterNames }: IncomingRequestsListProps) {
  const [rows, setRows] = useState(requests);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { pendingRequests, acceptedRequests, completedRequests } = useMemo(
    () => ({
      pendingRequests: rows.filter((request) => request.status === "pending"),
      acceptedRequests: rows.filter((request) => request.status === "confirmed"),
      completedRequests: rows.filter((request) => request.status === "completed"),
    }),
    [rows],
  );

  async function respond(requestId: string, status: "confirmed" | "cancelled") {
    setPendingId(requestId);
    try {
      const supabase = createClient();
      const request = rows.find((row) => row.id === requestId);
      const updated =
        status === "confirmed" && request?.service_type === "food"
          ? await confirmFoodPackageRequest(supabase, requestId)
          : status === "confirmed" && request?.service_type === "hostel"
            ? await confirmHostelRequest(supabase, requestId)
          : null;
      if (!updated) await updateRequestStatus(supabase, requestId, status);
      setRows((prev) => prev.map((r) => (r.id === requestId ? updated ?? { ...r, status } : r)));
      toast.success(status === "confirmed" ? "Request accepted" : "Request declined");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn't update the request. Try again.";
      toast.error(message);
    } finally {
      setPendingId(null);
    }
  }

  async function complete(requestId: string) {
    setPendingId(requestId);
    try {
      const supabase = createClient();
      const updated = await markRequestCompletedByOwner(supabase, requestId);
      setRows((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
      toast.success(updated.status === "completed" ? "Request completed" : "Completion marked");
    } catch {
      toast.error("Couldn't mark this request complete. Try again.");
    } finally {
      setPendingId(null);
    }
  }

  function renderRequestCard(request: RequestRow) {
    const canComplete = request.status === "confirmed" && !request.owner_completed_at;
    const waitingForStudent =
      request.status === "confirmed" && request.owner_completed_at && !request.requester_completed_at;
    const studentCompletedFirst =
      request.status === "confirmed" && request.requester_completed_at && !request.owner_completed_at;
    const completedDateLabel = request.completed_at
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(request.completed_at))
      : null;

    return (
      <div
        key={request.id}
        className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{requesterNames[request.id]}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Requested {formatRelativeDate(request.created_at)}
            </p>
          </div>
          <Badge className={cn("h-6 shrink-0 rounded-full px-2 text-[0.7rem] font-semibold", REQUEST_STATUS_STYLES[request.status])}>
            {REQUEST_STATUS_LABEL[request.status]}
          </Badge>
        </div>

        {request.note && (
          <p className="line-clamp-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
            {request.note}
          </p>
        )}

        {request.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 rounded-lg bg-brand-mint text-white hover:bg-brand-mint/90"
              disabled={pendingId === request.id}
              onClick={() => respond(request.id, "confirmed")}
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-lg"
              disabled={pendingId === request.id}
              onClick={() => respond(request.id, "cancelled")}
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
          </div>
        )}

        {request.status === "confirmed" && (canComplete || waitingForStudent || studentCompletedFirst) && (
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            {waitingForStudent ? (
              <p className="text-sm text-muted-foreground">Waiting for student to confirm completion.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {studentCompletedFirst && (
                  <p className="text-sm text-muted-foreground">Student marked this complete.</p>
                )}
                <Button
                  size="sm"
                  className="rounded-lg bg-brand-mint text-white hover:bg-brand-mint/90"
                  disabled={pendingId === request.id}
                  onClick={() => complete(request.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {pendingId === request.id ? "Completing..." : "Complete"}
                </Button>
              </div>
            )}
          </div>
        )}

        {request.status === "completed" && (
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <p className="text-sm font-medium text-foreground">Completed by both sides</p>
            {completedDateLabel && (
              <p className="mt-1 text-sm text-muted-foreground">Completed on {completedDateLabel}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderEmpty(message: string) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        {message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 md:px-6">
      <div className="grid grid-cols-3 gap-2">
        <SummaryPill label="Pending" value={pendingRequests.length} />
        <SummaryPill label="Accepted" value={acceptedRequests.length} />
        <SummaryPill label="Completed" value={completedRequests.length} />
      </div>

      <section className="flex flex-col gap-2.5">
        <SectionHeading title="Incoming requests" description="Pending students waiting for your response." />
        {pendingRequests.length > 0
          ? pendingRequests.map((request) => renderRequestCard(request))
          : renderEmpty("No pending requests right now.")}
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionHeading title="Accepted requests" description="Students you have already accepted." />
        {acceptedRequests.length > 0
          ? acceptedRequests.map((request) => renderRequestCard(request))
          : renderEmpty("No accepted requests yet.")}
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionHeading title="Completed requests" description="Requests both sides marked complete." />
        {completedRequests.length > 0
          ? completedRequests.map((request) => renderRequestCard(request))
          : renderEmpty("No completed requests yet.")}
      </section>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatRelativeDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
