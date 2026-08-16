import type { ServiceCategory } from "@/types/domain";

export const queryKeys = {
  currentUser: ["current-user"] as const,
  currentProfile: ["current-profile"] as const,
  serviceList: (category: ServiceCategory) => ["services", category, "list"] as const,
  serviceCard: (category: ServiceCategory, id: string) => ["services", category, "card", id] as const,
  profileRequests: (profileId: string) => ["requests", "profile", profileId] as const,
  ownedServices: (profileId: string) => ["services", "owned", profileId] as const,
  savedRequests: (profileId: string) => ["requests", "saved", profileId] as const,
  incomingRequests: (scopeKey: string) => ["requests", "incoming", scopeKey] as const,
  acceptedRequestContact: (requestId: string) => ["requests", "accepted-contact", requestId] as const,
  academicSupportRelationships: (profileId: string) => ["academic-support", "relationships", profileId] as const,
  housingRelationships: (profileId: string) => ["housing", "relationships", profileId] as const,
};
