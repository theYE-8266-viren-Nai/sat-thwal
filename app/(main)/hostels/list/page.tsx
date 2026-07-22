import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profiles";
import { getHostelByOwner } from "@/lib/queries/hostels";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListRoomForm } from "@/components/hostel-list/ListRoomForm";

export default async function ListRoomPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const existing = await getHostelByOwner(supabase, user.id);
  if (existing) redirect(`/services/hostel/${existing.id}`);

  const profile = await getProfile(supabase, user.id);

  return (
    <div className="pb-6">
      <PageHeader title="List Your Room" subtitle="Let other students know your spare room is available." />
      <ListRoomForm userId={user.id} defaultTownship={profile?.township ?? ""} />
    </div>
  );
}
