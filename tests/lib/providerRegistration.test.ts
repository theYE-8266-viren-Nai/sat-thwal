import { describe, expect, it } from "vitest";
import {
  calculateRatioProviderRegistrationFee,
  formatProviderRegistrationFeeRate,
  isProviderPaymentMethod,
  PROVIDER_REGISTRATION_FEES_MMK,
  PROVIDER_TYPE_LABELS,
} from "@/lib/providerRegistration";

describe("lib/providerRegistration", () => {
  it.each([
    [100000, 15000],
    ["100000", 15000],
    [999, 150],
    [0, 0],
    [-1, 0],
    ["not-a-number", 0],
  ])("should calculate a 15 percent fee for %s", (amount, expected) => {
    expect(calculateRatioProviderRegistrationFee(amount)).toBe(expected);
  });

  it("should format the percentage fee rate", () => {
    expect(formatProviderRegistrationFeeRate()).toBe("15%");
  });

  it.each(["kbzpay", "wavepay", "bank_transfer", "other"])(
    "should accept supported payment method %s",
    (method) => {
      expect(isProviderPaymentMethod(method)).toBe(true);
    },
  );

  it.each(["cash", "", "KBZPay"])("should reject unsupported method %s", (method) => {
    expect(isProviderPaymentMethod(method)).toBe(false);
  });

  it("should expose labels and fixed fees for every provider type", () => {
    expect(PROVIDER_TYPE_LABELS.restaurant).toBe("Restaurant provider");
    expect(PROVIDER_REGISTRATION_FEES_MMK).toMatchObject({
      tutor: 2000,
      hostel: 5000,
      transportation: 3000,
      restaurant: 20000,
    });
  });
});