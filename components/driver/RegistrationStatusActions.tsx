"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { updateTransportationRegistrationStatus } from "@/lib/queries/transportationRegistrations";
import type { TransportationRegistrationStatus } from "@/types/database.types";

interface RegistrationStatusActionsProps {
  registrationId: string;
  status: TransportationRegistrationStatus;
  studentName?: string | null;
  routeName?: string | null;
  pickupStopName?: string | null;
  pickupTime?: string | null;
  remainingSeats?: number | null;
}

export function RegistrationStatusActions({
  registrationId,
  status,
  studentName = "this student",
  routeName = "this route",
  pickupStopName = "the selected pickup stop",
  pickupTime,
  remainingSeats,
}: RegistrationStatusActionsProps) {
  const [submitting, setSubmitting] = useState<TransportationRegistrationStatus | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const router = useRouter();
  const disabled = status !== "pending" || submitting !== null;

  async function updateStatus(nextStatus: TransportationRegistrationStatus, reason?: string) {
    try {
      setSubmitting(nextStatus);
      const supabase = createClient();
      await updateTransportationRegistrationStatus(
        supabase,
        registrationId,
        nextStatus,
        reason,
      );
      toast.success(nextStatus === "approved" ? "Seat request approved" : "Seat request rejected");
      setApproveOpen(false);
      setRejectOpen(false);
      setRejectionReason("");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update this request.";
      toast.error(message);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
      <Button
        size="sm"
        className="flex-1 bg-brand-mint text-white shadow-sm hover:bg-brand-mint/90 sm:flex-none"
        disabled={disabled}
        onClick={() => setApproveOpen(true)}
        aria-label="Approve seat request"
      >
        {submitting === "approved" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="flex-1 border border-destructive/30 bg-card text-destructive hover:bg-destructive/10 sm:flex-none"
        disabled={disabled}
        onClick={() => setRejectOpen(true)}
        aria-label="Reject seat request"
      >
        {submitting === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
        Reject
      </Button>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve transportation request?</DialogTitle>
            <DialogDescription>
              Approve {studentName} for {routeName} from {pickupStopName}
              {pickupTime ? ` at ${pickupTime}` : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-brand-indigo">
            Remaining seats: {remainingSeats ?? "Not available"}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting !== null}>Cancel</Button>
            </DialogClose>
            <Button
              className="bg-brand-mint text-white hover:bg-brand-mint/90"
              disabled={submitting !== null}
              onClick={() => updateStatus("approved")}
            >
              {submitting === "approved" && <Loader2 className="h-4 w-4 animate-spin" />}
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject request?</DialogTitle>
            <DialogDescription>
              Reject {studentName}&apos;s request for {routeName}. Add a short reason if helpful.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm font-medium text-foreground">{pickupStopName}</p>
            {pickupTime && <p className="text-sm text-muted-foreground">{pickupTime}</p>}
          </div>
          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Optional rejection reason"
            rows={4}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting !== null}>Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={submitting !== null}
              onClick={() => updateStatus("rejected", rejectionReason.trim() || undefined)}
            >
              {submitting === "rejected" && <Loader2 className="h-4 w-4 animate-spin" />}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
