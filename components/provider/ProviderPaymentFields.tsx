"use client";

import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROVIDER_PAYMENT_METHOD_LABELS,
} from "@/lib/providerRegistration";
import { formatMMK } from "@/lib/utils";
import type { ProviderPaymentMethod } from "@/types/database.types";

interface ProviderPaymentFieldsProps {
  idPrefix: string;
  feeMmk: number;
  paymentMethod: ProviderPaymentMethod;
  transactionReference: string;
  onPaymentMethodChange: (method: ProviderPaymentMethod) => void;
  onTransactionReferenceChange: (reference: string) => void;
}

export function ProviderPaymentFields({
  idPrefix,
  feeMmk,
  paymentMethod,
  transactionReference,
  onPaymentMethodChange,
  onTransactionReferenceChange,
}: ProviderPaymentFieldsProps) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-mint/15 text-emerald-700">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Provider registration fee
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit the reference for your one-time {formatMMK(feeMmk)} payment.
            An administrator will verify it before publishing your service.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-payment-method`}>Payment method</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) =>
              onPaymentMethodChange(value as ProviderPaymentMethod)
            }
          >
            <SelectTrigger id={`${idPrefix}-payment-method`} className="w-full">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROVIDER_PAYMENT_METHOD_LABELS).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-transaction-reference`}>
            Transaction reference
          </Label>
          <Input
            id={`${idPrefix}-transaction-reference`}
            value={transactionReference}
            onChange={(event) =>
              onTransactionReferenceChange(event.target.value)
            }
            placeholder="Enter the payment reference"
            autoComplete="off"
          />
        </div>
      </div>
    </section>
  );
}
