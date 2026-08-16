import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../../helpers/supabaseMock";
import { getMonetizationReport } from "@/lib/admin/monetization";

describe("lib/admin/monetization", () => {
  it("should combine paid registration revenue with transportation commissions", async () => {
    const supabase = createSupabaseMock({
      provider_payment_submissions: {
        data: [
          { registration_id: "reg-tutor", amount_mmk: 15000, reviewed_at: "2026-01-01" },
          { registration_id: "reg-driver", amount_mmk: 3000, reviewed_at: "2026-01-02" },
          { registration_id: "unknown", amount_mmk: 9999, reviewed_at: "2026-01-03" },
        ],
        error: null,
      },
      provider_registrations: {
        data: [
          { id: "reg-tutor", provider_type: "tutor" },
          { id: "reg-driver", provider_type: "transportation" },
        ],
        error: null,
      },
      requests: {
        data: [{ service_id: "route-1" }, { service_id: "route-1" }, { service_id: "route-2" }],
        error: null,
      },
      transportation_routes: {
        data: [
          { id: "route-1", monthly_price: 40000 },
          { id: "route-2", monthly_price: 30000 },
        ],
        error: null,
      },
    });

    const report = await getMonetizationReport(supabase as never);

    expect(report.lineItems.find((item) => item.key === "tutor")).toMatchObject({ count: 1, totalMmk: 15000 });
    expect(report.lineItems.find((item) => item.key === "transportation")).toMatchObject({
      count: 1,
      commissionCount: 3,
      commissionMmk: 16500,
      totalMmk: 19500,
    });
    expect(report.totalMmk).toBe(34500);
  });

  it("should throw when any monetization query fails", async () => {
    const paymentError = new Error("payment query failed");
    await expect(
      getMonetizationReport(createSupabaseMock({ provider_payment_submissions: { data: null, error: paymentError } }) as never),
    ).rejects.toThrow(paymentError);

    const registrationError = new Error("registration query failed");
    await expect(
      getMonetizationReport(createSupabaseMock({
        provider_payment_submissions: { data: [{ registration_id: "reg-1", amount_mmk: 1 }], error: null },
        provider_registrations: { data: null, error: registrationError },
      }) as never),
    ).rejects.toThrow(registrationError);
  });

  it("should produce zero totals when there are no payments or commissions", async () => {
    const supabase = createSupabaseMock({
      provider_payment_submissions: { data: [], error: null },
      requests: { data: [], error: null },
    });

    const report = await getMonetizationReport(supabase as never);

    expect(report.totalMmk).toBe(0);
    expect(report.lineItems).toHaveLength(4);
    expect(report.lineItems.every((item) => item.totalMmk === 0)).toBe(true);
  });
});