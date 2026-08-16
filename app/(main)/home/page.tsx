"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTutors, tutorToCard } from "@/lib/queries/tutors";
import { getHostels, hostelToCard } from "@/lib/queries/hostels";
import { getFoodItems, groupFoodItemsByRestaurant, restaurantToCard } from "@/lib/queries/food";
import { getRoutes, routeToCard } from "@/lib/queries/transportation";
import { getRequests } from "@/lib/queries/requests";
import { getCurrentProfile, getOwnedServices } from "@/lib/serviceFlowData";
import { queryKeys } from "@/lib/queryKeys";
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { SmartMatchSearchBox } from "@/components/home/SmartMatchSearchBox";
import { CategoryCardGrid } from "@/components/home/CategoryCardGrid";
import { ServiceSection } from "@/components/home/ServiceSection";
import { RecentlyViewedSection } from "@/components/home/RecentlyViewedSection";
import { ActiveRequestsStrip, type ActiveRequestItem } from "@/components/home/ActiveRequestsStrip";
import { ServiceSectionSkeleton } from "@/components/services/ServiceCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServiceCardData } from "@/types/domain";

export default function HomePage() {
  const profileQuery = useQuery({
    queryKey: queryKeys.currentProfile,
    queryFn: () => getCurrentProfile(createClient()),
  });
  const profile = profileQuery.data ?? null;
  const profileId = profile?.id ?? null;

  const tutorsQuery = useQuery({
    queryKey: queryKeys.serviceList("tutor"),
    queryFn: () => getTutors(createClient()),
  });
  const hostelsQuery = useQuery({
    queryKey: queryKeys.serviceList("hostel"),
    queryFn: () => getHostels(createClient()),
  });
  const foodQuery = useQuery({
    queryKey: queryKeys.serviceList("food"),
    queryFn: () => getFoodItems(createClient()),
  });
  const routesQuery = useQuery({
    queryKey: queryKeys.serviceList("transportation"),
    queryFn: () => getRoutes(createClient()),
  });
  const requestsQuery = useQuery({
    queryKey: profileId ? queryKeys.profileRequests(profileId) : ["requests", "profile", "anonymous"],
    queryFn: () => getRequests(createClient(), profileId as string),
    enabled: Boolean(profileId),
  });
  const ownedServicesQuery = useQuery({
    queryKey: profileId ? queryKeys.ownedServices(profileId) : ["services", "owned", "anonymous"],
    queryFn: () => getOwnedServices(createClient(), profileId as string),
    enabled: Boolean(profileId),
  });

  const tutors = tutorsQuery.data ?? [];
  const hostels = hostelsQuery.data ?? [];
  const foodItems = foodQuery.data ?? [];
  const routes = routesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const restaurantGroups = groupFoodItemsByRestaurant(foodItems);
  const catalogLoading = [tutorsQuery, hostelsQuery, foodQuery, routesQuery].some(
    (query) => !query.data && query.isPending,
  );

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
      .filter((group) => group[0].restaurant.township === profile?.township)
      .slice(0, 2)
      .map(restaurantToCard),
    ...routes.filter((route) => route.pickup_township === profile?.township).slice(0, 2).map(routeToCard),
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
            .filter((hostel) => hostel.monthly_rent >= budgetMin && hostel.monthly_rent <= budgetMax)
            .slice(0, 3)
            .map(hostelToCard),
          ...routes
            .filter((route) => route.monthly_price >= budgetMin && route.monthly_price <= budgetMax)
            .slice(0, 3)
            .map(routeToCard),
        ].slice(0, 6)
      : [];

  const cardByKey = new Map<string, ServiceCardData>();
  tutors.forEach((tutor) => cardByKey.set(`tutor:${tutor.id}`, tutorToCard(tutor)));
  hostels.forEach((hostel) => cardByKey.set(`hostel:${hostel.id}`, hostelToCard(hostel)));
  restaurantGroups.forEach((group) => {
    const card = restaurantToCard(group);
    group.forEach((item) => cardByKey.set(`food:${item.package.id}`, card));
  });
  routes.forEach((route) => cardByKey.set(`transportation:${route.id}`, routeToCard(route)));

  const activeRequests: ActiveRequestItem[] = requests
    .filter((request) => request.status === "pending" || request.status === "confirmed")
    .slice(0, 5)
    .map((request) => {
      const card = cardByKey.get(`${request.service_type}:${request.service_id}`);
      return card ? { requestId: request.id, status: request.status, card } : null;
    })
    .filter((item): item is ActiveRequestItem => Boolean(item));

  if (!profile) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="pb-6">
      <GreetingHeader
        name={profile.full_name?.split(" ")[0] ?? "there"}
        township={profile.township}
        profileId={profile.id}
      />
      <SmartMatchSearchBox />

      <CategoryCardGrid
        existingTutorId={ownedServicesQuery.data?.tutorId ?? null}
        existingHostelId={ownedServicesQuery.data?.hostelId ?? null}
      />

      {catalogLoading ? (
        <>
          <ServiceSectionSkeleton title="Recommended student support" />
          <ServiceSectionSkeleton title="Near your school area" />
        </>
      ) : (
        <>
          <ServiceSection
            title="Recommended student support"
            items={recommended}
            emptyLabel="Complete your student profile to see school-relevant support options."
            preloadFirstImage
          />
          <ServiceSection
            title="Near your school area"
            items={nearby}
            emptyLabel="No school-approved support options found near your township yet."
          />
        </>
      )}

      {!requestsQuery.isPending && <ActiveRequestsStrip items={activeRequests} />}

      {catalogLoading ? (
        <>
          <ServiceSectionSkeleton title="Common student choices" />
          <ServiceSectionSkeleton title="Recently added support" />
        </>
      ) : (
        <>
          <ServiceSection title="Common student choices" items={popular} />
          <ServiceSection title="Recently added support" items={newListings} />
          <ServiceSection title="Within your stated budget" items={withinBudget} />
        </>
      )}

      <RecentlyViewedSection />
    </div>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5 pt-5 md:grid-cols-4 md:px-8" aria-label="Categories loading">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="pb-6">
      <div className="flex items-center justify-between px-5 pt-6 md:px-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-11 w-11 rounded-full" />
      </div>
      <Skeleton className="mx-5 mt-5 h-[72px] rounded-2xl md:mx-8" />
      <CategoryGridSkeleton />
      <ServiceSectionSkeleton title="Recommended student support" />
      <ServiceSectionSkeleton title="Near your school area" />
    </div>
  );
}
