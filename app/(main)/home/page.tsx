import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profiles";
import { getTutors, tutorToCard, getTutorByOwner } from "@/lib/queries/tutors";
import { getHostels, hostelToCard } from "@/lib/queries/hostels";
import { getFoodItems, foodToCard } from "@/lib/queries/food";
import { getRoutes, routeToCard } from "@/lib/queries/transportation";
import { getSavedItems } from "@/lib/queries/savedItems";
import { STUDENT_OFFERS } from "@/lib/constants/offers";
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { TutorCtaButtons } from "@/components/home/TutorCtaButtons";
import { SmartMatchSearchBox } from "@/components/home/SmartMatchSearchBox";
import { CategoryCardGrid } from "@/components/home/CategoryCardGrid";
import { ServiceSection } from "@/components/home/ServiceSection";
import { RecentlyViewedSection } from "@/components/home/RecentlyViewedSection";
import { OfferCard } from "@/components/home/OfferCard";
import type { ServiceCardData } from "@/types/domain";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, tutors, hostels, foodItems, routes, savedItems, ownedTutor] = await Promise.all([
    getProfile(supabase, user.id),
    getTutors(supabase),
    getHostels(supabase),
    getFoodItems(supabase),
    getRoutes(supabase),
    getSavedItems(supabase, user.id),
    getTutorByOwner(supabase, user.id),
  ]);

  const savedKeys = new Set(savedItems.map((s) => `${s.service_type}:${s.service_id}`));

  const recommended: ServiceCardData[] = [
    ...tutors.filter((t) => t.university === profile?.university).slice(0, 2).map(tutorToCard),
    ...hostels.filter((h) => h.university === profile?.university).slice(0, 2).map(hostelToCard),
    ...[...foodItems].sort((a, b) => b.restaurant.rating - a.restaurant.rating).slice(0, 2).map(foodToCard),
    ...routes.filter((r) => r.university === profile?.university).slice(0, 2).map(routeToCard),
  ].slice(0, 6);

  const nearby: ServiceCardData[] = [
    ...tutors.filter((t) => t.township === profile?.township).slice(0, 2).map(tutorToCard),
    ...hostels.filter((h) => h.township === profile?.township).slice(0, 2).map(hostelToCard),
    ...foodItems.filter((f) => f.restaurant.township === profile?.township).slice(0, 2).map(foodToCard),
    ...routes.filter((r) => r.pickup_township === profile?.township).slice(0, 2).map(routeToCard),
  ].slice(0, 6);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="pb-6">
      <GreetingHeader
        name={firstName}
        university={profile?.university ?? null}
        township={profile?.township ?? null}
      />
      <TutorCtaButtons existingTutorId={ownedTutor?.id ?? null} />
      <SmartMatchSearchBox />
      <CategoryCardGrid />

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

      <RecentlyViewedSection profileId={user.id} savedKeys={savedKeys} />

      <section className="mt-7 px-5 md:px-8">
        <h2 className="mb-3 text-lg font-bold text-foreground">Student discounts & offers</h2>
        <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0">
          {STUDENT_OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>
    </div>
  );
}
