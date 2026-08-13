import type { ServiceCategory } from "@/types/domain";

export const queryKeys = {
  currentUser: ["current-user"] as const,
  serviceList: (category: ServiceCategory) => ["services", category, "list"] as const,
  serviceCard: (category: ServiceCategory, id: string) => ["services", category, "card", id] as const,
  savedRequests: (profileId: string) => ["requests", "saved", profileId] as const,
  incomingRequests: (scopeKey: string) => ["requests", "incoming", scopeKey] as const,
};
