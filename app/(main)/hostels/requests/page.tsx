import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth/server";
import { getHostelByOwner } from "@/lib/queries/hostels";
import { getProfilesByIds } from "@/lib/queries/profiles";
import { getRequestsForHostel } from "@/lib/queries/requests";
import { PageHeader } from "@/components/shared/PageHeader";
import { IncomingRequestsList } from "@/components/requests/IncomingRequestsList";

export default async function HostelRequestsPage() {
  const { supabase, userId } = await getServerAuthContext();
  if (!userId) return null;

  const hostel = await getHostelByOwner(supabase, userId);
  if (!hostel) redirect("/hostels/list");

  const requests = await getRequestsForHostel(supabase, hostel.id);
  const requesters = await getProfilesByIds(supabase, [...new Set(requests.map((r) => r.profile_id))]);
  const requesterMap = new Map(requesters.map((p) => [p.id, p]));

  return (
    <div className="pb-6">
      <PageHeader title="Hostel Requests" subtitle="Review new requests and track accepted stays." />
      <IncomingRequestsList
        requests={requests}
        requesterNames={Object.fromEntries(
          requests.map((r) => [r.id, requesterMap.get(r.profile_id)?.full_name ?? "A student"]),
        )}
        scopeKey={`hostel:${hostel.id}`}
        scope={{ serviceType: "hostel", serviceIds: [hostel.id] }}
      />
    </div>
  );
}
