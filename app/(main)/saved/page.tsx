"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRequests } from "@/lib/queries/requests";
import { getTutorsByIds, tutorToCard } from "@/lib/queries/tutors";
import { getHostelsByIds, hostelToCard } from "@/lib/queries/hostels";
import { getFoodItemsByIds, foodToCard } from "@/lib/queries/food";
import { getRoutesByIds, routeToCard } from "@/lib/queries/transportation";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceCardSkeleton } from "@/components/services/ServiceCardSkeleton";
import { RequestCard } from "@/components/saved/RequestCard";
import { EmptyState } from "@/components/services/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database, RequestStatus } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

export default function SavedPage() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [requests, setRequests] = useState<{ request: RequestRow; card: ServiceCardData }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const requestRows = await getRequests(supabase, user.id);

      const idsByCategory: Record<string, Set<string>> = {
        tutor: new Set(),
        hostel: new Set(),
        food: new Set(),
        transportation: new Set(),
      };
      requestRows.forEach((r) => idsByCategory[r.service_type].add(r.service_id));

      const [tutors, hostels, foodItems, routes] = await Promise.all([
        getTutorsByIds(supabase, [...idsByCategory.tutor]),
        getHostelsByIds(supabase, [...idsByCategory.hostel]),
        getFoodItemsByIds(supabase, [...idsByCategory.food]),
        getRoutesByIds(supabase, [...idsByCategory.transportation]),
      ]);

      const cardMap = new Map<string, ServiceCardData>();
      tutors.forEach((t) => cardMap.set(`tutor:${t.id}`, tutorToCard(t)));
      hostels.forEach((h) => cardMap.set(`hostel:${h.id}`, hostelToCard(h)));
      foodItems.forEach((f) => cardMap.set(`food:${f.meal.id}`, foodToCard(f)));
      routes.forEach((r) => cardMap.set(`transportation:${r.id}`, routeToCard(r)));

      if (cancelled) return;

      setRequests(
        requestRows
          .map((r) => {
            const card = cardMap.get(`${r.service_type}:${r.service_id}`);
            return card ? { request: r, card } : null;
          })
          .filter((r): r is { request: RequestRow; card: ServiceCardData } => Boolean(r)),
      );
      setProfileId(user.id);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function getDisplayStatus(request: RequestRow): RequestStatus {
    if (
      request.status === "confirmed" &&
      request.requester_completed_at &&
      request.owner_completed_at
    ) {
      return "completed";
    }
    return request.status;
  }

  function requestsByStatus(status: RequestStatus) {
    return requests.filter((r) => getDisplayStatus(r.request) === status);
  }

  function handleRequestChange(updated: RequestRow) {
    setRequests((prev) =>
      prev.map((item) => (item.request.id === updated.id ? { ...item, request: updated } : item)),
    );
  }

  function renderRequestGrid(status: RequestStatus, emptyMessage: string) {
    const items = requestsByStatus(status);
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (items.length === 0 || !profileId) return <EmptyState message={emptyMessage} />;
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ request, card }) => (
          <RequestCard
            key={request.id}
            requestId={request.id}
            data={card}
            status={getDisplayStatus(request)}
            note={request.note}
            profileId={profileId}
            initialSaved={false}
            hideSaveButton
            requesterCompletedAt={request.requester_completed_at}
            ownerCompletedAt={request.owner_completed_at}
            completedAt={request.completed_at}
            onRequestChange={handleRequestChange}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Saved & Bookings" />
      <div className="px-5 md:px-8">
        <Tabs defaultValue="pending">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="pending">Pending bookings</TabsTrigger>
            <TabsTrigger value="confirmed">Accepted</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="pt-4">
            {renderRequestGrid("pending", "No pending bookings right now.")}
          </TabsContent>
          <TabsContent value="confirmed" className="pt-4">
            {renderRequestGrid("confirmed", "No accepted requests yet.")}
          </TabsContent>
          <TabsContent value="completed" className="pt-4">
            {renderRequestGrid("completed", "No completed requests yet.")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
