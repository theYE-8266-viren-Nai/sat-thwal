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

const PROVIDER_VERIFICATION_CHANNEL_LABELS: Record<ProviderPaymentMethod, string> = {
  kbzpay: "Student affairs office",
  wavepay: "School admin desk",
  bank_transfer: "Partner school coordinator",
  other: "Other school verifier",
};

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
  const [submitting, setSubmitting] = useState(false);

  if (!registration) {
    return (
      <Card className="mx-auto max-w-2xl gap-3 border-dashed p-5">
        <div className="flex items-center gap-2 text-foreground">
          <ShieldAlert className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <h2 className="font-semibold">School verification setup required</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          This account is not linked to a school verification request yet. Contact a
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
        Provider approved by school
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
                School verification under review
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your {PROVIDER_TYPE_LABELS[providerType].toLowerCase()} tools
                will unlock after a school administrator approves the profile.
              </p>
            </div>
          </div>
          <Badge variant="secondary">Pending review</Badge>
        </div>
        {payment && (
          <dl className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Approval status</dt>
              <dd className="mt-1 font-medium text-foreground">
                Awaiting school verification
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Verification channel</dt>
              <dd className="mt-1 break-all font-medium text-foreground">
                {PROVIDER_VERIFICATION_CHANNEL_LABELS[payment.payment_method]}
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
          Contact the administrator to review this school approval.
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
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("School verification submitted for review.");
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
            Complete school verification
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your service remains private until the school verification is
            approved.
          </p>
        </div>
        <Badge variant="outline">Approval required</Badge>
      </div>

      {payment?.status === "rejected" && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm">
          <p className="font-medium text-destructive">Previous verification rejected</p>
          <p className="mt-1 text-muted-foreground">
            {payment.rejection_reason || "Check the provider details and submit again."}
          </p>
        </div>
      )}

      <ProviderPaymentFields
        idPrefix={`${providerType}-registration`}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
      />

      <Button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className="self-end bg-brand-indigo hover:bg-brand-indigo-dark"
      >
        {submitting ? "Submitting..." : "Submit for school approval"}
      </Button>
    </Card>
  );
}
