"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock, Clock3, MapPin, Phone, Route } from "lucide-react";
import { toast } from "sonner";
import { RegistrationStatusActions } from "@/components/driver/RegistrationStatusActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { markRequestProvided } from "@/lib/queries/requests";
import type { TransportationRegistrationWithDetails } from "@/lib/queries/transportationRegistrations";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLES } from "@/lib/constants/requestStatus";
import { cn } from "@/lib/utils";

interface DriverTransportationRequestsListProps {
  requests: TransportationRegistrationWithDetails[];
}

export function DriverTransportationRequestsList({ requests }: DriverTransportationRequestsListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();
  const pendingRequests = requests.filter((request) => request.status === "pending");
  const acceptedRequests = requests.filter((request) => request.status === "confirmed");
  const completedRequests = requests.filter((request) => request.status === "completed");

  async function markProvided(requestId: string) {
    setPendingId(requestId);
    try {
      const supabase = createClient();
      await markRequestProvided(supabase, requestId);
      toast.success("Support marked as provided.");
      router.refresh();
    } catch {
      toast.error("Couldn't mark support as provided. Try again.");
    } finally {
      setPendingId(null);
    }
  }

  function renderRequestCard(request: TransportationRegistrationWithDetails) {
    const studentName = request.student?.full_name ?? "Student";
    const routeName = request.route?.route_name ?? "Transportation route";
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
      <article key={request.id} className="content-visibility-list-item flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-foreground">{studentName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{routeName}</p>
          </div>
          <Badge className={cn("shrink-0 px-2.5 text-xs font-semibold", REQUEST_STATUS_STYLES[request.status])}>
            {REQUEST_STATUS_LABEL[request.status]}
          </Badge>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <span className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" />
            <span>
              <span className="block font-medium text-foreground">
                {request.pickup_stop_name ?? "Pickup stop pending"}
              </span>
              {request.pickup_address ?? "Pickup address not added"}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-brand-mint" />
            {request.pickup_time ?? "Pickup time pending"}
          </span>
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-brand-mint" />
            {request.student?.phone ?? "No phone added"}
          </span>
          <span className="flex items-center gap-2">
            <Route className="h-4 w-4 shrink-0 text-brand-mint" />
            {request.route?.vehicle_number ?? "Vehicle not added"}
          </span>
        </div>

        {request.note && (
          <p className="rounded-lg bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
            {request.note}
          </p>
        )}

        {request.rejection_reason && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Rejection reason: {request.rejection_reason}
          </p>
        )}

        {request.status === "pending" && (
          <RegistrationStatusActions
            registrationId={request.id}
            status={request.status}
            studentName={studentName}
            routeName={routeName}
            pickupStopName={request.pickup_stop_name}
            pickupTime={request.pickup_time}
            remainingSeats={request.route?.available_seats}
          />
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
                  disabled={pendingId === request.id}
                  aria-busy={pendingId === request.id}
                  onClick={() => markProvided(request.id)}
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
      </article>
    );
  }

  function renderSection(
    title: string,
    description: string,
    rows: TransportationRegistrationWithDetails[],
    emptyMessage: string,
  ) {
    return (
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {rows.length > 0 ? (
          rows.map((request) => renderRequestCard(request))
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {renderSection(
        "Incoming requests",
        "Pending students waiting for your response.",
        pendingRequests,
        "No pending transportation requests right now.",
      )}
      {renderSection(
        "Accepted requests",
        "Students you have already approved.",
        acceptedRequests,
        "No accepted transportation requests yet.",
      )}
      {renderSection(
        "Resolved requests",
        "Cases closed by student, system, or school admin.",
        completedRequests,
        "No resolved transportation requests yet.",
      )}
    </div>
  );
}
