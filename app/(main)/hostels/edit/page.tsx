import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth/server";
import { getHostelByOwner } from "@/lib/queries/hostels";
import { PageHeader } from "@/components/shared/PageHeader";
import { HostelEditForm } from "@/components/hostel-edit/HostelEditForm";

export default async function HostelEditPage() {
  const { supabase, userId } = await getServerAuthContext();
  if (!userId) return null;

  const hostel = await getHostelByOwner(supabase, userId);
  if (!hostel) redirect("/hostels/list");

  return (
    <div className="pb-6">
      <PageHeader title="Edit Room Listing" subtitle="Update how students see your listing." />
      <HostelEditForm
        userId={userId}
        defaultName={hostel.name}
        defaultImageUrl={hostel.image_url ?? ""}
        defaultTownship={hostel.township}
        defaultDistanceKm={String(hostel.distance_km)}
        defaultMonthlyRent={String(hostel.monthly_rent)}
        defaultGenderPolicy={hostel.gender_policy}
        defaultRoomType={hostel.room_type}
        defaultFacilities={hostel.facilities}
        defaultAvailableRooms={String(hostel.available_rooms)}
        defaultMealsIncluded={hostel.meals_included}
        defaultDescription={hostel.description ?? ""}
      />
    </div>
  );
}
