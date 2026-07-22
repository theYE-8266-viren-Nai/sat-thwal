import { requireAdminProfile } from "@/lib/admin/auth";
import { getMonetizationReport } from "@/lib/admin/monetization";
import { formatMMK } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdminProfile();
  const monetizationReport = await getMonetizationReport(supabase);

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-8">
      <section className="mx-auto max-w-5xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Welcome, {profile.full_name ?? "admin"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin users are routed here instead of the student or driver dashboards.
        </p>
      </section>

      <section className="mx-auto mt-6 max-w-5xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Monetization Report</h2>
          <p className="text-sm text-muted-foreground">
            Estimated revenue only. Payments, invoices, and settlement tracking are not enabled yet.
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Estimated total revenue</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">
            {formatMMK(monetizationReport.totalMmk)}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {monetizationReport.lineItems.map((item) => (
            <article
              key={item.key}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{item.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.count} x {formatMMK(item.feeMmk)}
                  </p>
                </div>
                <p className="shrink-0 text-base font-semibold text-foreground">
                  {formatMMK(item.totalMmk)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
