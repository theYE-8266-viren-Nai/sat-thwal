import { requireRestaurantProfile } from "@/lib/restaurant/auth";
import { getFoodPackagesForRestaurant, getRestaurantByOwner } from "@/lib/queries/food";
import { getProfilesByIds } from "@/lib/queries/profiles";
import { getRequestsForRestaurant } from "@/lib/queries/requests";
import { EmptyState } from "@/components/services/EmptyState";
import { IncomingRequestsList } from "@/components/requests/IncomingRequestsList";
import { FoodPackageManager } from "@/components/restaurant/FoodPackageManager";

export default async function RestaurantDashboardPage() {
  const { supabase, profile } = await requireRestaurantProfile();

  const restaurant = await getRestaurantByOwner(supabase, profile.id);
  if (!restaurant) {
    return (
      <EmptyState message="Your account isn't linked to a restaurant yet. Contact Set Thwal support to get set up." />
    );
  }

  const packages = await getFoodPackagesForRestaurant(supabase, restaurant.id);
  const requests = await getRequestsForRestaurant(supabase, restaurant.id);
  const requesters = await getProfilesByIds(supabase, [...new Set(requests.map((r) => r.profile_id))]);
  const requesterMap = new Map(requesters.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-8">
      <FoodPackageManager restaurantId={restaurant.id} packages={packages} />
      {requests.length === 0 ? (
        <EmptyState message="No one has subscribed to your packages yet." />
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
