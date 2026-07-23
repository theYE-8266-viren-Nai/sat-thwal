"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProviderPaymentFields } from "@/components/provider/ProviderPaymentFields";
import { submitProviderRegistrationPayment } from "@/lib/actions/providerRegistrations";
import {
  PROVIDER_PAYMENT_METHOD_LABELS,
  PROVIDER_TYPE_LABELS,
} from "@/lib/providerRegistration";
import type {
  ProviderPaymentMethod,
  ProviderType,
} from "@/types/database.types";
import type {
  ProviderPaymentSubmission,
  ProviderRegistration,
} from "@/lib/queries/providerRegistrations";

interface ProviderRegistrationGateProps {
  providerType: ProviderType;
  registration: ProviderRegistration | null;
  payment: ProviderPaymentSubmission | null;
  compact?: boolean;
}

export function ProviderRegistrationGate({
  providerType,
  registration,
  payment,
  compact = false,
}: ProviderRegistrationGateProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] =
    useState<ProviderPaymentMethod>("kbzpay");
  const [transactionReference, setTransactionReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!registration) {
    return (
      <Card className="mx-auto max-w-2xl gap-3 border-dashed p-5">
        <div className="flex items-center gap-2 text-foreground">
          <ShieldAlert className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <h2 className="font-semibold">Registration setup required</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          This account is not linked to a provider registration yet. Contact a
          platform administrator.
        </p>
      </Card>
    );
  }
  const registrationId = registration.id;

  if (registration.status === "active") {
    return compact ? (
      <div className="mx-5 mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 md:mx-8">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Provider registration active
      </div>
    ) : null;
  }

  if (registration.status === "payment_review") {
    return (
      <Card className="mx-auto max-w-2xl gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 text-brand-indigo" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-foreground">
                Payment under review
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your {PROVIDER_TYPE_LABELS[providerType].toLowerCase()} tools
                will unlock after an administrator confirms the payment.
              </p>
            </div>
          </div>
          <Badge variant="secondary">Pending review</Badge>
        </div>
        {payment && (
          <dl className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Method</dt>
              <dd className="mt-1 font-medium text-foreground">
                {PROVIDER_PAYMENT_METHOD_LABELS[payment.payment_method]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Reference</dt>
              <dd className="mt-1 break-all font-medium text-foreground">
                {payment.transaction_reference}
              </dd>
            </div>
          </dl>
        )}
      </Card>
    );
  }

  if (registration.status === "suspended") {
    return (
      <Card className="mx-auto max-w-2xl gap-3 p-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
          <h2 className="font-semibold text-foreground">Provider access suspended</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Contact the administrator to review this provider registration.
        </p>
      </Card>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const result = await submitProviderRegistrationPayment({
        registrationId,
        paymentMethod,
        transactionReference,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Payment reference submitted for review.");
      setTransactionReference("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl gap-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-foreground">
            Complete provider registration
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your service remains private until the registration payment is
            confirmed.
          </p>
        </div>
        <Badge variant="outline">Payment required</Badge>
      </div>

      {payment?.status === "rejected" && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm">
          <p className="font-medium text-destructive">Previous payment rejected</p>
          <p className="mt-1 text-muted-foreground">
            {payment.rejection_reason || "Check the reference and submit it again."}
          </p>
        </div>
      )}

      <ProviderPaymentFields
        idPrefix={`${providerType}-registration`}
        feeMmk={registration.fee_amount_mmk}
        paymentMethod={paymentMethod}
        transactionReference={transactionReference}
        onPaymentMethodChange={setPaymentMethod}
        onTransactionReferenceChange={setTransactionReference}
      />

      <Button
        type="button"
        disabled={!transactionReference.trim() || submitting}
        onClick={handleSubmit}
        className="self-end bg-brand-indigo hover:bg-brand-indigo-dark"
      >
        {submitting ? "Submitting..." : "Submit payment reference"}
      </Button>
    </Card>
  );
}
