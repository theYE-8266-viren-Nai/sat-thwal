import { NextResponse } from "next/server";
import {
  auditFiltersFromSearchParams,
  createAdminAuditCsv,
  getAdminAuditEvents,
} from "@/lib/admin/auditTrail";
import { requireAdminProfile } from "@/lib/admin/auth";

export async function GET(request: Request) {
  const { supabase } = await requireAdminProfile();
  const url = new URL(request.url);
  const filters = auditFiltersFromSearchParams(
    Object.fromEntries(url.searchParams.entries()),
  );
  const events = await getAdminAuditEvents(supabase, filters, 1000);
  const csv = createAdminAuditCsv(events);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="admin-audit-trail-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
