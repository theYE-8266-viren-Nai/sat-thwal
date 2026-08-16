"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getFoodItems } from "@/lib/queries/food";
import { getHostels } from "@/lib/queries/hostels";
import { getRequests } from "@/lib/queries/requests";
import { getRoutes } from "@/lib/queries/transportation";
import { getTutors } from "@/lib/queries/tutors";
import { queryKeys } from "@/lib/queryKeys";
import { getCurrentProfile, getOwnedServices } from "@/lib/serviceFlowData";

interface PredictiveNavLinkProps extends React.ComponentProps<typeof Link> {
  href: string;
}

export function PredictiveNavLink({ href, ...props }: PredictiveNavLinkProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const prefetch = useCallback(() => {
    router.prefetch(href);
    if (href !== "/home" && href !== "/profile") return;

    const supabase = createClient();
    const profileId = queryClient.getQueryData<string | null>(queryKeys.currentUser);
    const tasks: Promise<unknown>[] = [
      queryClient.prefetchQuery({
        queryKey: queryKeys.currentProfile,
        queryFn: () => getCurrentProfile(supabase),
      }),
    ];

    if (profileId) {
      tasks.push(
        queryClient.prefetchQuery({
          queryKey: queryKeys.profileRequests(profileId),
          queryFn: () => getRequests(supabase, profileId),
        }),
      );
    }

    if (href === "/home") {
      tasks.push(
        queryClient.prefetchQuery({
          queryKey: queryKeys.serviceList("tutor"),
          queryFn: () => getTutors(supabase),
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.serviceList("hostel"),
          queryFn: () => getHostels(supabase),
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.serviceList("food"),
          queryFn: () => getFoodItems(supabase),
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.serviceList("transportation"),
          queryFn: () => getRoutes(supabase),
        }),
      );

      if (profileId) {
        tasks.push(
          queryClient.prefetchQuery({
            queryKey: queryKeys.ownedServices(profileId),
            queryFn: () => getOwnedServices(supabase, profileId),
          }),
        );
      }
    }

    void Promise.all(tasks);
  }, [href, queryClient, router]);

  return (
    <Link
      href={href}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      {...props}
    />
  );
}
