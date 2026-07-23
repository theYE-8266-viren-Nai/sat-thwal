"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import { getTutorsByIds, tutorToCard } from "@/lib/queries/tutors";
import { getHostelsByIds, hostelToCard } from "@/lib/queries/hostels";
import { getFoodItemsByIds, foodToCard } from "@/lib/queries/food";
import { getRoutesByIds, routeToCard } from "@/lib/queries/transportation";
import { ServiceSection } from "@/components/home/ServiceSection";
import type { ServiceCardData } from "@/types/domain";

export function RecentlyViewedSection({
  profileId,
  savedKeys,
}: {
  profileId: string;
  savedKeys: Set<string>;
}) {
  const [items, setItems] = useState<ServiceCardData[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const entries = getRecentlyViewed();
      if (entries.length === 0) {
        if (!cancelled) setReady(true);
        return;
      }

      const idsFor = (category: string) =>
        entries.filter((e) => e.category === category).map((e) => e.id);

      const supabase = createClient();
      const [tutors, hostels, foodItems, routes] = await Promise.all([
        getTutorsByIds(supabase, idsFor("tutor")),
        getHostelsByIds(supabase, idsFor("hostel")),
        getFoodItemsByIds(supabase, idsFor("food")),
        getRoutesByIds(supabase, idsFor("transportation")),
      ]);

      const cardMap = new Map<string, ServiceCardData>();
      tutors.forEach((t) => cardMap.set(`tutor:${t.id}`, tutorToCard(t)));
      hostels.forEach((h) => cardMap.set(`hostel:${h.id}`, hostelToCard(h)));
      foodItems.forEach((f) => cardMap.set(`food:${f.package.id}`, foodToCard(f)));
      routes.forEach((r) => cardMap.set(`transportation:${r.id}`, routeToCard(r)));

      const ordered = entries
        .map((e) => cardMap.get(`${e.category}:${e.id}`))
        .filter((card): card is ServiceCardData => Boolean(card));

      if (!cancelled) {
        setItems(ordered);
        setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || items.length === 0) return null;

  return (
    <ServiceSection title="Recently viewed" items={items} profileId={profileId} savedKeys={savedKeys} />
  );
}
