import type { ProviderPaymentMethod, ProviderType } from "@/types/database.types";

export const PROVIDER_REGISTRATION_FEES_MMK: Record<ProviderType, number> = {
  tutor: 2_000,
  hostel: 5_000,
  transportation: 3_000,
  restaurant: 20_000,
};

export const RATIO_PROVIDER_REGISTRATION_FEE_RATE = 0.15;

export function calculateRatioProviderRegistrationFee(amount: string | number) {
  const parsedAmount =
    typeof amount === "number" ? amount : Number.parseInt(amount, 10);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return 0;

  return Math.round(parsedAmount * RATIO_PROVIDER_REGISTRATION_FEE_RATE);
}

export function formatProviderRegistrationFeeRate() {
  return `${Math.round(RATIO_PROVIDER_REGISTRATION_FEE_RATE * 100)}%`;
}

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  tutor: "Tutor",
  hostel: "Hostel provider",
  transportation: "Transportation provider",
  restaurant: "Restaurant provider",
};

export const PROVIDER_PAYMENT_METHOD_LABELS: Record<ProviderPaymentMethod, string> = {
  kbzpay: "KBZPay",
  wavepay: "WavePay",
  bank_transfer: "Bank transfer",
  other: "Other",
};

export function isProviderPaymentMethod(value: string): value is ProviderPaymentMethod {
  return value === "kbzpay"
    || value === "wavepay"
    || value === "bank_transfer"
    || value === "other";
}
