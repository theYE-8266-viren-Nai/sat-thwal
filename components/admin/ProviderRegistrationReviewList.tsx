"use client";

import { useState } from "react";
import { Check, Clock3, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewProviderRegistrationPayment } from "@/lib/actions/providerRegistrations";
import {
  PROVIDER_PAYMENT_METHOD_LABELS,
  formatProviderRegistrationFeeRate,
  PROVIDER_TYPE_LABELS,
} from "@/lib/providerRegistration";
import type { ProviderRegistrationReview } from "@/lib/queries/providerRegistrations";
import { formatMMK } from "@/lib/utils";

interface ProviderRegistrationReviewListProps {
  reviews: ProviderRegistrationReview[];
}

export function ProviderRegistrationReviewList({
  reviews,
}: ProviderRegistrationReviewListProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<ProviderRegistrationReview | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function openReview(
    review: ProviderRegistrationReview,
    nextDecision: "approve" | "reject",
  ) {
    setSelected(review);
    setDecision(nextDecision);
    setRejectionReason("");
  }

  async function handleConfirm() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const result = await reviewProviderRegistrationPayment({
        paymentId: selected.payment.id,
        approve: decision === "approve",
        rejectionReason,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(
        decision === "approve"
          ? "Provider payment approved and account activated."
          : "Payment rejected. The provider can submit again.",
      );
      setSelected(null);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-dashed p-8 text-center">
        <Clock3 className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-3 font-semibold text-foreground">No payments awaiting review</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          New provider payments will appear here.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.payment.id} className="gap-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-foreground">
                    {review.providerName}
                  </h2>
                  <Badge variant="secondary">
                    {PROVIDER_TYPE_LABELS[review.registration.provider_type]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {review.providerPhone || "No phone number on profile"}
                </p>
              </div>
              <p className="font-semibold text-foreground">
                {formatMMK(review.payment.amount_mmk)}
              </p>
            </div>

            <dl className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Fee</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {formatProviderRegistrationFeeRate()} of listing amount
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Method</dt>
                <dd className="mt-1 break-all font-medium text-foreground">
                  {PROVIDER_PAYMENT_METHOD_LABELS[review.payment.payment_method]}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {new Date(review.payment.submitted_at).toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => openReview(review, "reject")}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Reject
              </Button>
              <Button
                className="bg-brand-indigo hover:bg-brand-indigo-dark"
                onClick={() => openReview(review, "approve")}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Approve payment
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === "approve" ? "Approve provider payment?" : "Reject payment?"}
            </DialogTitle>
            <DialogDescription>
              {decision === "approve"
                ? "This records received revenue and immediately activates the provider."
                : "The provider will return to payment required and can submit again."}
            </DialogDescription>
          </DialogHeader>

          {decision === "reject" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="provider-payment-rejection-reason">
                Rejection reason (optional)
              </Label>
              <Textarea
                id="provider-payment-rejection-reason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="For example, the payment could not be verified"
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setSelected(null)}
            >
              Cancel
            </Button>
            <Button
              variant={decision === "approve" ? "default" : "destructive"}
              disabled={submitting}
              onClick={handleConfirm}
              className={decision === "approve" ? "bg-brand-indigo hover:bg-brand-indigo-dark" : undefined}
            >
              {submitting
                ? "Saving..."
                : decision === "approve"
                  ? "Approve and activate"
                  : "Reject payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
