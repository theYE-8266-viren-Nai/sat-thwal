import type { ServiceType } from "./database.types";

export type ServiceCategory = ServiceType;

export interface ServiceCardMeta {
  icon: "map-pin" | "clock" | "users" | "book-open" | "utensils" | "bus" | "wallet";
  label: string;
}

export interface ServiceCardData {
  id: string;
  category: ServiceCategory;
  image: string | null;
  title: string;
  subtitle: string;
  priceLabel: string;
  rating?: number;
  reviewCount?: number;
  verified: boolean;
  meta: ServiceCardMeta[];
  ctaLabel: string;
  href: string;
}

export type FilterFieldType = "select" | "range" | "toggle" | "multiselect";

export interface FilterFieldOption {
  label: string;
  value: string;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  type: FilterFieldType;
  options?: FilterFieldOption[];
  min?: number;
  max?: number;
  step?: number;
}

export type FilterValue = string | string[] | [number, number] | boolean | undefined;
export type FilterState = Record<string, FilterValue>;

export interface StudentProfile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  university: string | null;
  academicYear: string | null;
  township: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredSubjects: string[];
  languagePreference: string;
  notificationOptIn: boolean;
  onboardingCompleted: boolean;
}
