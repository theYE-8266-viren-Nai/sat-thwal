import type { ServiceCategory } from "./domain";

export interface ServiceDetailData {
  id: string;
  category: ServiceCategory;
  image: string | null;
  title: string;
  providerName: string;
  providerAvatar: string | null;
  verified: boolean;
  rating?: number;
  reviewCount?: number;
  priceLabel: string;
  availabilityLines: string[];
  locationLabel: string;
  description: string;
  amenities: string[];
  ctaLabel: string;
  contactInfo: string;
}
