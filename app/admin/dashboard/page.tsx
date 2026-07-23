import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { requireAdminProfile } from "@/lib/admin/auth";
import { getMonetizationReport } from "@/lib/admin/monetization";
import { getAdminRequestDetails } from "@/lib/admin/requestDetails";
import { getAdminServiceOverview } from "@/lib/admin/serviceOverview";
import { getPendingProviderRegistrationCount } from "@/lib/queries/providerRegistrations";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLES } from "@/lib/constants/requestStatus";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatMMK } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdminProfile();
  const [serviceOverview, requestDetails, monetizationReport, pendingPaymentCount] =
    await Promise.all([
      getAdminServiceOverview(supabase),
      getAdminRequestDetails(supabase),
      getMonetizationReport(supabase),
      getPendingProviderRegistrationCount(supabase),
    ]);

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-8">
      <section className="mx-auto max-w-5xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              Welcome, {profile.full_name ?? "admin"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Admin users are routed here instead of the student or driver dashboards.
            </p>
          </div>
          <div className="sm:w-36">
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Service Overview</h2>
          <p className="text-sm text-muted-foreground">
            Live counts across the four student service categories.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {serviceOverview.map((item) => (
            <article
              key={item.key}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{item.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Total
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {item.totalCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Active
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {item.activeRequestCount}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Request Details</h2>
          <p className="text-sm text-muted-foreground">
            Recent student requests and accepted bookings across every category.
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {requestDetails.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">
              No request activity has been recorded yet.
            </div>
          ) : (
            <div className="max-h-[32rem] overflow-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-border bg-secondary text-xs uppercase tracking-wide text-muted-foreground shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-medium">Requester</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Listing</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Requested</th>
                    <th className="px-4 py-3 font-medium">Accepted</th>
                    <th className="px-4 py-3 font-medium">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requestDetails.map((request) => (
                    <tr key={request.id} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{request.requesterName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {request.requesterPhone ?? "No phone added"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {request.serviceLabel}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{request.serviceName}</p>
                        {request.providerName && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {request.providerName}
                          </p>
                        )}
                        {request.note && (
                          <p className="mt-2 max-w-60 text-xs text-muted-foreground">
                            Note: {request.note}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            "px-2.5 text-xs font-semibold",
                            REQUEST_STATUS_STYLES[request.status],
                          )}
                        >
                          {REQUEST_STATUS_LABEL[request.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(request.requestedAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {request.acceptedAt ? formatDateTime(request.acceptedAt) : "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {request.completedAt ? formatDateTime(request.completedAt) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Monetization Report</h2>
          <p className="text-sm text-muted-foreground">
            Revenue received from provider registrations and 15% service commissions.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Received revenue</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {formatMMK(monetizationReport.totalMmk)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Payments awaiting review</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">
                  {pendingPaymentCount}
                </p>
              </div>
              <Clock3 className="h-5 w-5 text-brand-indigo" aria-hidden="true" />
            </div>
            <Button variant="link" asChild className="mt-2 h-auto p-0">
              <Link href="/admin/provider-registrations">
                Review registrations
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
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
                    {item.count} paid registration{item.count === 1 ? "" : "s"}
                  </p>
                  {item.commissionCount > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.commissionCount} {item.commissionLabel}
                      {item.commissionCount === 1 ? "" : "s"} at 15%
                    </p>
                  )}
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
