"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfileId, getSavedRequestItems } from "@/lib/serviceFlowData";
import { queryKeys } from "@/lib/queryKeys";
import { PageHeader } from "@/components/shared/PageHeader";
import { ServiceCardSkeleton } from "@/components/services/ServiceCardSkeleton";
import { RequestCard } from "@/components/saved/RequestCard";
import { EmptyState } from "@/components/services/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database, RequestStatus } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

export default function SavedPage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => getCurrentProfileId(createClient()),
  });
  const profileId = profileQuery.data ?? null;
  const requestsQuery = useQuery({
    queryKey: profileId ? queryKeys.savedRequests(profileId) : ["requests", "saved", "anonymous"],
    queryFn: () => getSavedRequestItems(createClient(), profileId as string),
    enabled: Boolean(profileId),
  });
  const requests = requestsQuery.data ?? [];
  const loading = !requestsQuery.data && (requestsQuery.isPending || profileQuery.isPending);

  function getDisplayStatus(request: RequestRow): RequestStatus {
    if (
      request.status === "confirmed" &&
      !request.student_disputed_at &&
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
    if (!profileId) return;
    queryClient.setQueryData<{ request: RequestRow; card: ServiceCardData }[]>(
      queryKeys.savedRequests(profileId),
      (prev = []) =>
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
          <div key={request.id} className="content-visibility-list-item">
            <RequestCard
              profileId={profileId}
              requestId={request.id}
              data={card}
              status={getDisplayStatus(request)}
              note={request.note}
              requesterCompletedAt={request.requester_completed_at}
              ownerCompletedAt={request.owner_completed_at}
              completedAt={request.completed_at}
              studentDisputedAt={request.student_disputed_at}
              studentDisputeReason={request.student_dispute_reason}
              autoResolveAt={request.auto_resolve_at}
              resolutionSource={request.resolution_source}
              onRequestChange={handleRequestChange}
            />
          </div>
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
            <TabsTrigger value="completed">Resolved</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="pt-4">
            {renderRequestGrid("pending", "No pending bookings right now.")}
          </TabsContent>
          <TabsContent value="confirmed" className="pt-4">
            {renderRequestGrid("confirmed", "No accepted requests yet.")}
          </TabsContent>
          <TabsContent value="completed" className="pt-4">
            {renderRequestGrid("completed", "No resolved requests yet.")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
