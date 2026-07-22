import { BookOpen, Building2, Utensils, Bus, type LucideIcon } from "lucide-react";
import type { ServiceCategory } from "@/types/domain";

export interface CategoryConfig {
  category: ServiceCategory;
  label: string;
  singularLabel: string;
  href: string;
  icon: LucideIcon;
  color: string;
  detailCtaLabel: string;
  bookCtaLabel: string;
}

export const CATEGORIES: Record<ServiceCategory, CategoryConfig> = {
  tutor: {
    category: "tutor",
    label: "Find a Tutor",
    singularLabel: "Tutor",
    href: "/tutors",
    icon: BookOpen,
    color: "var(--category-tutor)",
    detailCtaLabel: "View Profile",
    bookCtaLabel: "Request Session",
  },
  hostel: {
    category: "hostel",
    label: "Find a Hostel",
    singularLabel: "Hostel",
    href: "/hostels",
    icon: Building2,
    color: "var(--category-hostel)",
    detailCtaLabel: "View Details",
    bookCtaLabel: "Request Room",
  },
  food: {
    category: "food",
    label: "Find Food",
    singularLabel: "Restaurant",
    href: "/food",
    icon: Utensils,
    color: "var(--category-food)",
    detailCtaLabel: "View Details",
    bookCtaLabel: "Order",
  },
  transportation: {
    category: "transportation",
    label: "Find Transportation",
    singularLabel: "University Ferry",
    href: "/transportation",
    icon: Bus,
    color: "var(--category-transport)",
    detailCtaLabel: "View Details",
    bookCtaLabel: "Request Seat",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
