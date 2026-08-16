"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { queryKeys } from "@/lib/queryKeys";
import type { ServiceCardData } from "@/types/domain";

export function usePredictivePrefetch(data?: ServiceCardData) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (!data) return;
    router.prefetch(data.href);
    queryClient.setQueryData(queryKeys.serviceCard(data.category, data.id), data);
  }, [data, queryClient, router]);
}
