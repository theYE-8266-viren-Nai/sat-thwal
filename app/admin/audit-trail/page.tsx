import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import {
  AUDIT_CATEGORY_LABELS,
  AUDIT_ENTITY_LABELS,
  AUDIT_EVENT_LABELS,
  auditFiltersFromSearchParams,
  getAdminAuditEvents,
  getAuditExportUrl,
  type AdminAuditEvent,
} from "@/lib/admin/auditTrail";
import { requireAdminProfile } from "@/lib/admin/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminAuditTrailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ENTITY_OPTIONS = [
  ["request", "Student requests"],
  ["provider_registration", "Provider approvals"],
] as const;

const EVENT_OPTIONS = Object.entries(AUDIT_EVENT_LABELS);
const CATEGORY_OPTIONS = Object.entries(AUDIT_CATEGORY_LABELS);

export default async function AdminAuditTrailPage({
  searchParams,
}: AdminAuditTrailPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = auditFiltersFromSearchParams(resolvedSearchParams);
  const { supabase } = await requireAdminProfile();
  const events = await getAdminAuditEvents(supabase, filters);
  const exportUrl = getAuditExportUrl(filters);

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Button variant="ghost" asChild className="-ml-3 mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            School Admin Dashboard
          </Link>
        </Button>

        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              School operations audit
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              Admin case audit trail
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review request decisions, completion signals, and provider approvals in one durable
              school-controlled record.
            </p>
          </div>
          <Button asChild className="bg-brand-indigo hover:bg-brand-indigo-dark">
            <Link href={exportUrl}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV
            </Link>
          </Button>
        </section>

        <AuditFilters filters={filters} />
        <AuditTable events={events} />
      </div>
    </main>
  );
}

function AuditFilters({
  filters,
}: {
  filters: ReturnType<typeof auditFiltersFromSearchParams>;
}) {
  return (
    <form className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="entityType">Entity</Label>
          <Select name="entityType" defaultValue={filters.entityType ?? "all"}>
            <SelectTrigger id="entityType" className="w-full">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              {ENTITY_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="eventType">Event</Label>
          <Select name="eventType" defaultValue={filters.eventType ?? "all"}>
            <SelectTrigger id="eventType" className="w-full">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {EVENT_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={filters.category ?? "all"}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="from">From</Label>
          <Input id="from" name="from" type="date" defaultValue={filters.from} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="to">To</Label>
          <Input id="to" name="to" type="date" defaultValue={filters.to} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" className="bg-brand-indigo hover:bg-brand-indigo-dark">
          Apply filters
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/audit-trail">Reset</Link>
        </Button>
      </div>
    </form>
  );
}

function AuditTable({ events }: { events: AdminAuditEvent[] }) {
  return (
    <section className="mt-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Audit Events</h2>
        <p className="text-sm text-muted-foreground">
          Showing the latest {events.length} school-visible operation
          {events.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {events.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No audit events match these filters.
          </div>
        ) : (
          <div className="max-h-[36rem] overflow-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-border bg-secondary text-xs uppercase tracking-wide text-muted-foreground shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Summary</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event) => (
                  <tr key={event.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDateTime(event.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {AUDIT_EVENT_LABELS[event.eventType]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {event.actorName ?? "System"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.actorRole ?? "No actor recorded"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {AUDIT_ENTITY_LABELS[event.entityType]}
                      </p>
                      <p className="mt-1 max-w-44 truncate text-xs text-muted-foreground">
                        {event.entityId}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {event.summary}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {event.category ? AUDIT_CATEGORY_LABELS[event.category] : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
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
