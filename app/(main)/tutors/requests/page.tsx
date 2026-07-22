import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTutorByOwner } from "@/lib/queries/tutors";
import { getRequestsForTutor } from "@/lib/queries/requests";
import { getProfilesByIds } from "@/lib/queries/profiles";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/services/EmptyState";
import { IncomingRequestsList } from "@/components/tutor-requests/IncomingRequestsList";

export default async function TutorRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const tutor = await getTutorByOwner(supabase, user.id);
  if (!tutor) redirect("/tutors/apply");

  const requests = await getRequestsForTutor(supabase, tutor.id);
  const requesters = await getProfilesByIds(supabase, [...new Set(requests.map((r) => r.profile_id))]);
  const requesterMap = new Map(requesters.map((p) => [p.id, p]));

  return (
    <div className="pb-6">
      <PageHeader title="Tutor Requests" subtitle="Review new requests and track accepted sessions." />
      {requests.length === 0 ? (
        <div className="px-5 md:px-8">
          <EmptyState message="No one has requested a session with you yet." />
        </div>
      ) : (
        <IncomingRequestsList
          requests={requests}
          requesterNames={Object.fromEntries(
            requests.map((r) => [r.id, requesterMap.get(r.profile_id)?.full_name ?? "A student"]),
          )}
        />
      )}
    </div>
  );
}
