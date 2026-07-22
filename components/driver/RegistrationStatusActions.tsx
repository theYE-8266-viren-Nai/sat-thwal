"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { updateTransportationRegistrationStatus } from "@/lib/queries/transportationRegistrations";
import type { TransportationRegistrationStatus } from "@/types/database.types";

interface RegistrationStatusActionsProps {
  registrationId: string;
  status: TransportationRegistrationStatus;
}

export function RegistrationStatusActions({
  registrationId,
  status,
}: RegistrationStatusActionsProps) {
  const [submitting, setSubmitting] = useState<TransportationRegistrationStatus | null>(null);
  const router = useRouter();
  const disabled = status !== "pending" || submitting !== null;

  async function updateStatus(nextStatus: TransportationRegistrationStatus) {
    if (nextStatus === "approved") {
      const confirmed = window.confirm("Approve this seat request?");
      if (!confirmed) return;
    }

    const rejectionReason =
      nextStatus === "rejected" ? window.prompt("Reason for rejection?") ?? undefined : undefined;
    if (nextStatus === "rejected" && rejectionReason === undefined) return;

    try {
      setSubmitting(nextStatus);
      const supabase = createClient();
      await updateTransportationRegistrationStatus(
        supabase,
        registrationId,
        nextStatus,
        rejectionReason,
      );
      toast.success(nextStatus === "approved" ? "Seat request approved" : "Seat request rejected");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update this request.";
      toast.error(message);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        className="bg-brand-mint text-white hover:bg-emerald-600"
        disabled={disabled}
        onClick={() => updateStatus("approved")}
        aria-label="Approve seat request"
      >
        <CheckCircle2 className="h-4 w-4" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={disabled}
        onClick={() => updateStatus("rejected")}
        aria-label="Reject seat request"
      >
        <XCircle className="h-4 w-4" />
        Reject
      </Button>
    </div>
  );
}
