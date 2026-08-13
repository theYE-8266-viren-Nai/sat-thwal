import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHostelByOwner } from "@/lib/queries/hostels";
import { getProfilesByIds } from "@/lib/queries/profiles";
import { getRequestsForHostel } from "@/lib/queries/requests";
import { PageHeader } from "@/components/shared/PageHeader";
import { IncomingRequestsList } from "@/components/requests/IncomingRequestsList";

export default async function HostelRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const hostel = await getHostelByOwner(supabase, user.id);
  if (!hostel) redirect("/hostels/list");

  const requests = await getRequestsForHostel(supabase, hostel.id);
  const requesters = await getProfilesByIds(supabase, [...new Set(requests.map((r) => r.profile_id))]);
  const requesterMap = new Map(requesters.map((p) => [p.id, p]));

  return (
    <div className="pb-6">
      <PageHeader title="Room Requests" subtitle="Students who requested your room listing." />
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
