"use client";

import { ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProviderPaymentMethod } from "@/types/database.types";

const PROVIDER_VERIFICATION_CHANNEL_LABELS: Record<ProviderPaymentMethod, string> = {
  kbzpay: "Student affairs office",
  wavepay: "School admin desk",
  bank_transfer: "Partner school coordinator",
  other: "Other school verifier",
};

interface ProviderPaymentFieldsProps {
  idPrefix: string;
  paymentMethod: ProviderPaymentMethod;
  onPaymentMethodChange: (method: ProviderPaymentMethod) => void;
}

export function ProviderPaymentFields({
  idPrefix,
  paymentMethod,
  onPaymentMethodChange,
}: ProviderPaymentFieldsProps) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-mint/15 text-emerald-700">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            School verification request
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how the school should verify this provider profile before it
            is approved for students.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-payment-method`}>Verification channel</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) =>
              onPaymentMethodChange(value as ProviderPaymentMethod)
            }
          >
            <SelectTrigger id={`${idPrefix}-payment-method`} className="w-full">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROVIDER_VERIFICATION_CHANNEL_LABELS).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

      </div>
    </section>
  );
}
