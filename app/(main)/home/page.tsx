import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profiles";
import { getTutors, tutorToCard, getTutorByOwner } from "@/lib/queries/tutors";
import { getHostels, hostelToCard, getHostelByOwner } from "@/lib/queries/hostels";
import { getFoodItems, groupFoodItemsByRestaurant, restaurantToCard } from "@/lib/queries/food";
import { getRoutes, routeToCard } from "@/lib/queries/transportation";
import { getSavedItems } from "@/lib/queries/savedItems";
import { getRequests } from "@/lib/queries/requests";
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { SmartMatchSearchBox } from "@/components/home/SmartMatchSearchBox";
import { CategoryCardGrid } from "@/components/home/CategoryCardGrid";
import { ServiceSection } from "@/components/home/ServiceSection";
import { RecentlyViewedSection } from "@/components/home/RecentlyViewedSection";
import { ActiveRequestsStrip, type ActiveRequestItem } from "@/components/home/ActiveRequestsStrip";
import type { ServiceCardData } from "@/types/domain";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, tutors, hostels, foodItems, routes, savedItems, ownedTutor, ownedHostel, requests] =
    await Promise.all([
      getProfile(supabase, user.id),
      getTutors(supabase),
      getHostels(supabase),
      getFoodItems(supabase),
      getRoutes(supabase),
      getSavedItems(supabase, user.id),
      getTutorByOwner(supabase, user.id),
      getHostelByOwner(supabase, user.id),
      getRequests(supabase, user.id),
    ]);

  const savedKeys = new Set(savedItems.map((s) => `${s.service_type}:${s.service_id}`));
  const restaurantGroups = groupFoodItemsByRestaurant(foodItems);

  const recommended: ServiceCardData[] = [
    ...tutors.slice(0, 2).map(tutorToCard),
    ...hostels.slice(0, 2).map(hostelToCard),
    ...[...restaurantGroups]
      .sort((a, b) => b[0].restaurant.rating - a[0].restaurant.rating)
      .slice(0, 2)
      .map(restaurantToCard),
    ...routes.slice(0, 2).map(routeToCard),
  ].slice(0, 6);

  const nearby: ServiceCardData[] = [
    ...tutors.filter((t) => t.township === profile?.township).slice(0, 2).map(tutorToCard),
    ...hostels.filter((h) => h.township === profile?.township).slice(0, 2).map(hostelToCard),
    ...restaurantGroups
      .filter((g) => g[0].restaurant.township === profile?.township)
      .slice(0, 2)
      .map(restaurantToCard),
    ...routes.filter((r) => r.pickup_township === profile?.township).slice(0, 2).map(routeToCard),
  ].slice(0, 6);

  const popular: ServiceCardData[] = [
    ...[...tutors]
      .sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
      .slice(0, 3)
      .map(tutorToCard),
    ...[...restaurantGroups]
      .sort((a, b) => b[0].restaurant.rating - a[0].restaurant.rating)
      .slice(0, 3)
      .map(restaurantToCard),
  ].slice(0, 6);

  const byNewest = (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime();
  const newListings: ServiceCardData[] = [
    ...[...tutors].sort((a, b) => byNewest(a.created_at, b.created_at)).slice(0, 2).map(tutorToCard),
    ...[...hostels].sort((a, b) => byNewest(a.created_at, b.created_at)).slice(0, 2).map(hostelToCard),
    ...[...restaurantGroups]
      .sort((a, b) => byNewest(a[0].restaurant.created_at, b[0].restaurant.created_at))
      .slice(0, 2)
      .map(restaurantToCard),
    ...[...routes].sort((a, b) => byNewest(a.created_at, b.created_at)).slice(0, 2).map(routeToCard),
  ].slice(0, 6);

  const budgetMin = profile?.budget_min;
  const budgetMax = profile?.budget_max;
  const withinBudget: ServiceCardData[] =
    budgetMin != null && budgetMax != null
      ? [
          ...hostels
            .filter((h) => h.monthly_rent >= budgetMin && h.monthly_rent <= budgetMax)
            .slice(0, 3)
            .map(hostelToCard),
          ...routes
            .filter((r) => r.monthly_price >= budgetMin && r.monthly_price <= budgetMax)
            .slice(0, 3)
            .map(routeToCard),
        ].slice(0, 6)
      : [];

  const cardByKey = new Map<string, ServiceCardData>();
  tutors.forEach((t) => cardByKey.set(`tutor:${t.id}`, tutorToCard(t)));
  hostels.forEach((h) => cardByKey.set(`hostel:${h.id}`, hostelToCard(h)));
  restaurantGroups.forEach((group) => {
    const card = restaurantToCard(group);
    group.forEach((item) => cardByKey.set(`food:${item.package.id}`, card));
  });
  routes.forEach((r) => cardByKey.set(`transportation:${r.id}`, routeToCard(r)));

  const activeRequests: ActiveRequestItem[] = requests
    .filter((r) => r.status === "pending" || r.status === "confirmed")
    .slice(0, 5)
    .map((r) => {
      const card = cardByKey.get(`${r.service_type}:${r.service_id}`);
      return card ? { requestId: r.id, status: r.status, card } : null;
    })
    .filter((item): item is ActiveRequestItem => Boolean(item));

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="pb-6">
      <GreetingHeader
        name={firstName}
        township={profile?.township ?? null}
        profileId={user.id}
      />
      <SmartMatchSearchBox />
      <CategoryCardGrid
        existingTutorId={ownedTutor?.id ?? null}
        existingHostelId={ownedHostel?.id ?? null}
      />

      <ServiceSection
        title="Recommended for you"
        items={recommended}
        profileId={user.id}
        savedKeys={savedKeys}
        emptyLabel="Complete your profile preferences to see personalized picks."
      />

      <ServiceSection
        title="Nearby student services"
        items={nearby}
        profileId={user.id}
        savedKeys={savedKeys}
        emptyLabel="No services found near your township yet."
      />

      <ActiveRequestsStrip items={activeRequests} />

      <ServiceSection
        title="Popular right now"
        items={popular}
        profileId={user.id}
        savedKeys={savedKeys}
      />

      <ServiceSection
        title="New listings"
        items={newListings}
        profileId={user.id}
        savedKeys={savedKeys}
      />

      <ServiceSection
        title="Within your budget"
        items={withinBudget}
        profileId={user.id}
        savedKeys={savedKeys}
      />

      <RecentlyViewedSection profileId={user.id} savedKeys={savedKeys} />
    </div>
  );
}
