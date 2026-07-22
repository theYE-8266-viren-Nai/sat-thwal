import { notFound } from "next/navigation";
import { Wallet, Clock, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTutorById, tutorToDetail } from "@/lib/queries/tutors";
import { getHostelById, hostelToDetail } from "@/lib/queries/hostels";
import { getFoodItemById, foodToDetail } from "@/lib/queries/food";
import { getRouteById, routeToDetail } from "@/lib/queries/transportation";
import { getExistingActiveRequest } from "@/lib/queries/requests";
import { isSaved } from "@/lib/queries/savedItems";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceDetailHeader } from "@/components/detail/ServiceDetailHeader";
import { ProviderInfo } from "@/components/detail/ProviderInfo";
import { DetailInfoSection } from "@/components/detail/DetailInfoSection";
import { AmenitiesList } from "@/components/detail/AmenitiesList";
import { DetailActionBar } from "@/components/detail/DetailActionBar";
import { RecordRecentlyViewed } from "@/components/detail/RecordRecentlyViewed";
import { RouteTimeline } from "@/components/transportation/RouteTimeline";
import type { ServiceCategory } from "@/types/domain";
import type { ServiceDetailData } from "@/types/detail";

const VALID_CATEGORIES: ServiceCategory[] = ["tutor", "hostel", "food", "transportation"];

const AMENITIES_TITLE: Record<ServiceCategory, string> = {
  tutor: "Subjects taught",
  hostel: "Facilities & amenities",
  food: "Meal details",
  transportation: "Included",
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;

  if (!VALID_CATEGORIES.includes(category as ServiceCategory)) notFound();
  const typedCategory = category as ServiceCategory;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let detail: ServiceDetailData | null = null;

  if (typedCategory === "tutor") {
    const row = await getTutorById(supabase, id);
    detail = row ? tutorToDetail(row) : null;
  } else if (typedCategory === "hostel") {
    const row = await getHostelById(supabase, id);
    detail = row ? hostelToDetail(row) : null;
  } else if (typedCategory === "food") {
    const row = await getFoodItemById(supabase, id);
    detail = row ? foodToDetail(row) : null;
  } else {
    const row = await getRouteById(supabase, id);
    detail = row ? routeToDetail(row) : null;
  }

  if (!detail) notFound();

  const isOwner = detail.ownerProfileId === user.id;
  const [saved, existingRequest] = await Promise.all([
    isSaved(supabase, user.id, typedCategory, id),
    getExistingActiveRequest(supabase, user.id, typedCategory, id),
  ]);

  return (
    <div className="pb-4">
      <RecordRecentlyViewed category={typedCategory} id={id} />
      <PageHeader title={detail.title} />
      <ServiceDetailHeader data={detail} />
      <ProviderInfo data={detail} />

      <div className="px-5 md:px-8">
        <DetailInfoSection icon={Wallet} title="Pricing" lines={[detail.priceLabel]} />
        <DetailInfoSection icon={Clock} title="Availability" lines={detail.availabilityLines} />
        <DetailInfoSection icon={MapPin} title="Location" lines={[detail.locationLabel]} />
      </div>

      {typedCategory === "transportation" && detail.routeStops && (
        <div className="px-5 py-4 md:px-8">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Complete route</h3>
          <div className="rounded-lg border border-border bg-card p-4">
            <RouteTimeline stops={detail.routeStops} />
          </div>
        </div>
      )}

      <div className="px-5 py-2 md:px-8">
        <h3 className="mb-1 text-sm font-semibold text-foreground">Description</h3>
        <p className="text-sm text-muted-foreground">{detail.description}</p>
      </div>

      <AmenitiesList title={AMENITIES_TITLE[typedCategory]} items={detail.amenities} />

      <DetailActionBar
        category={typedCategory}
        serviceId={id}
        profileId={user.id}
        title={detail.title}
        contactInfo={detail.contactInfo}
        initialSaved={saved}
        isOwner={isOwner}
        routeStops={detail.routeStops}
        existingRequestStatus={existingRequest?.status ?? null}
      />
    </div>
  );
}
