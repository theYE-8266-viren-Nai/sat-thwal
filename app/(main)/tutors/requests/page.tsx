import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth/server";
import { getTutorByOwner } from "@/lib/queries/tutors";
import { getRequestsForTutor } from "@/lib/queries/requests";
import { getProfilesByIds } from "@/lib/queries/profiles";
import { PageHeader } from "@/components/shared/PageHeader";
import { IncomingRequestsList } from "@/components/requests/IncomingRequestsList";

export default async function TutorRequestsPage() {
  const { supabase, userId } = await getServerAuthContext();
  if (!userId) return null;

  const tutor = await getTutorByOwner(supabase, userId);
  if (!tutor) redirect("/tutors/apply");

  const requests = await getRequestsForTutor(supabase, tutor.id);
  const requesters = await getProfilesByIds(supabase, [...new Set(requests.map((r) => r.profile_id))]);
  const requesterMap = new Map(requesters.map((p) => [p.id, p]));

  return (
    <div className="pb-6">
      <PageHeader title="Tutor Requests" subtitle="Review new requests and track accepted sessions." />
      <IncomingRequestsList
        requests={requests}
        requesterNames={Object.fromEntries(
          requests.map((r) => [r.id, requesterMap.get(r.profile_id)?.full_name ?? "A student"]),
        )}
        scopeKey={`tutor:${tutor.id}`}
        scope={{ serviceType: "tutor", serviceIds: [tutor.id] }}
      />
    </div>
  );
}
