import Link from "next/link";
import { ArrowRight, ClipboardList, Clock3 } from "lucide-react";
import { requireAdminProfile } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRestaurantOwnerAccounts } from "@/lib/admin/ownerAccounts";
import { getAdminRequestDetails } from "@/lib/admin/requestDetails";
import { getSchoolReportingMetrics } from "@/lib/admin/schoolReportingMetrics";
import { getAdminServiceOverview } from "@/lib/admin/serviceOverview";
import { getPendingProviderRegistrationCount } from "@/lib/queries/providerRegistrations";
import { resolveDueRequests } from "@/lib/queries/requests";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLES } from "@/lib/constants/requestStatus";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { RestaurantOwnerAccounts } from "@/components/admin/RestaurantOwnerAccounts";
import { RequestResolutionActions } from "@/components/admin/RequestResolutionActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdminProfile();
  await resolveDueRequests(supabase);
  const ownerAccountsResult = await loadRestaurantOwnerAccounts();
  const [
    schoolReportingMetrics,
    serviceOverview,
    requestDetails,
    pendingApprovalCount,
  ] = await Promise.all([
    getSchoolReportingMetrics(supabase),
    getAdminServiceOverview(supabase),
    getAdminRequestDetails(supabase),
    getPendingProviderRegistrationCount(supabase),
  ]);
  const totalServiceCount = serviceOverview.reduce((sum, item) => sum + item.totalCount, 0);
  const activeRequestTotal = serviceOverview.reduce(
    (sum, item) => sum + item.activeRequestCount,
    0,
  );
  const resolvedRequestCount = requestDetails.filter(
    (request) => request.status === "completed",
  ).length;
  const reviewQueue = requestDetails.filter((request) =>
    request.resolutionState === "disputed" ||
    request.resolutionState === "awaiting_student" ||
    request.resolutionState === "auto_resolve_due_soon"
  );

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-8">
      <section className="mx-auto max-w-5xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              School Admin Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              Welcome, {profile.full_name ?? "admin"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Govern student welfare services, provider approvals, and request activity
              from one UIT-controlled workspace.
            </p>
          </div>
          <div className="sm:w-36">
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            School Reporting Metrics
          </h2>
          <p className="text-sm text-muted-foreground">
            Government-ready indicators for student support demand and provider readiness.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Active requests</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {schoolReportingMetrics.activeRequestCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Approved providers</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {schoolReportingMetrics.approvedProviderCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Pending approvals</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {schoolReportingMetrics.pendingApprovalCount}
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold text-foreground">Service Demand by Category</h3>
          </div>
          <div className="divide-y divide-border">
            {schoolReportingMetrics.demandByCategory.map((item) => (
              <div
                key={item.key}
                className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_7rem_7rem_7rem]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {item.sharePercent}%
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-brand-indigo"
                      style={{ width: `${item.sharePercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.requestCount} total request{item.requestCount === 1 ? "" : "s"}
                  </p>
                </div>
                <MetricCell label="Active" value={item.activeRequestCount} />
                <MetricCell label="Approved" value={item.approvedProviderCount} />
                <MetricCell label="Pending" value={item.pendingApprovalCount} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Service Overview</h2>
          <p className="text-sm text-muted-foreground">
            Live school visibility across academic support, accommodation, food, and transport.
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

      <RestaurantOwnerAccounts
        accounts={ownerAccountsResult.accounts}
        setupError={ownerAccountsResult.error}
      />

      <section className="mx-auto mt-6 max-w-5xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Resolution Review Queue</h2>
          <p className="text-sm text-muted-foreground">
            Disputed and provider-confirmed cases that need school visibility.
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {reviewQueue.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground lg:col-span-2">
              No cases need review right now.
            </div>
          ) : (
            reviewQueue.slice(0, 8).map((request) => (
              <article key={request.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{request.requesterName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {request.serviceLabel} - {request.serviceName}
                    </p>
                  </div>
                  <Badge className={cn("px-2.5 text-xs font-semibold", getResolutionBadgeClass(request.resolutionState))}>
                    {getResolutionLabel(request.resolutionState)}
                  </Badge>
                </div>
                {request.studentDisputeReason && (
                  <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
                    {request.studentDisputeReason}
                  </p>
                )}
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <span>Provider confirmed: {request.ownerCompletedAt ? formatDateTime(request.ownerCompletedAt) : "-"}</span>
                  <span>Auto-resolve: {request.autoResolveAt ? formatDateTime(request.autoResolveAt) : "-"}</span>
                </div>
                <div className="mt-4">
                  <RequestResolutionActions
                    requestId={request.id}
                    requesterName={request.requesterName}
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Request Details</h2>
          <p className="text-sm text-muted-foreground">
            Recent student requests and school-visible service outcomes across every category.
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
                    <th className="px-4 py-3 font-medium">Resolved</th>
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
                          {request.resolutionState === "disputed"
                            ? "Disputed"
                            : request.resolutionState === "awaiting_student"
                              ? "Provider confirmed"
                              : request.resolutionState === "auto_resolve_due_soon"
                                ? "Auto-resolve due soon"
                                : REQUEST_STATUS_LABEL[request.status]}
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
          <h2 className="text-lg font-semibold text-foreground">School Governance Center</h2>
          <p className="text-sm text-muted-foreground">
            Operational signals for provider oversight, student demand, and service readiness.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Approved service records</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {totalServiceCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Providers awaiting review</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">
                  {pendingApprovalCount}
                </p>
              </div>
              <Clock3 className="h-5 w-5 text-brand-indigo" aria-hidden="true" />
            </div>
            <Button variant="link" asChild className="mt-2 h-auto p-0">
              <Link href="/admin/provider-registrations">
                Review providers
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Active student requests</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {activeRequestTotal}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Pending or confirmed requests requiring service follow-up.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Resolved support cases</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {resolvedRequestCount}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Student support cases closed through student, system, or admin resolution.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:col-span-2 lg:col-span-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-brand-indigo" aria-hidden="true" />
                  <p className="font-semibold text-foreground">Admin case audit trail</p>
                </div>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Review request decisions, resolution signals, provider approvals, and export
                  school-visible case history for reporting.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/admin/audit-trail">
                  View audit trail
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

async function loadRestaurantOwnerAccounts() {
  try {
    const adminClient = createAdminClient();
    return {
      accounts: await getRestaurantOwnerAccounts(adminClient),
      error: null,
    };
  } catch {
    return {
      accounts: [],
      error:
        "Restaurant owner emails need SUPABASE_SERVICE_ROLE_KEY in .env.local. Add the service_role key from Supabase Project Settings > API Keys, then restart the dev server.",
    };
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function MetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getResolutionLabel(state: string) {
  if (state === "disputed") return "Disputed";
  if (state === "auto_resolve_due_soon") return "Auto-resolve due soon";
  if (state === "awaiting_student") return "Awaiting student response";
  return "Open";
}

function getResolutionBadgeClass(state: string) {
  if (state === "disputed") return "bg-destructive/10 text-destructive";
  if (state === "auto_resolve_due_soon") return "bg-brand-orange/15 text-orange-700";
  if (state === "awaiting_student") return "bg-brand-indigo/10 text-brand-indigo";
  return "bg-secondary text-secondary-foreground";
}
