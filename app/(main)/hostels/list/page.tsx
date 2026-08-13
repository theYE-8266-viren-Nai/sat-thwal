import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth/server";
import { getHostelByOwner } from "@/lib/queries/hostels";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListRoomForm } from "@/components/hostel-list/ListRoomForm";

export default async function ListRoomPage() {
  const { supabase, userId, profile } = await getServerAuthContext();
  if (!userId) return null;

  const existing = await getHostelByOwner(supabase, userId);
  if (existing) redirect(`/services/hostel/${existing.id}`);

  return (
    <div className="pb-6">
      <PageHeader title="List Your Room" subtitle="Let other students know your spare room is available." />
      <ListRoomForm userId={userId} defaultTownship={profile?.township ?? ""} />
    </div>
  );
}
