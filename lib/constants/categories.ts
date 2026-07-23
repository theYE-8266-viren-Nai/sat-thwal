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
    label: "Tutor",
    singularLabel: "Tutor",
    href: "/tutors",
    icon: BookOpen,
    color: "var(--category-tutor)",
    detailCtaLabel: "Book Session",
    bookCtaLabel: "Request Session",
  },
  hostel: {
    category: "hostel",
    label: "Hostel",
    singularLabel: "Hostel",
    href: "/hostels",
    icon: Building2,
    color: "var(--category-hostel)",
    detailCtaLabel: "Book Hostel",
    bookCtaLabel: "Request Room",
  },
  food: {
    category: "food",
    label: "Find Food Service",
    singularLabel: "Restaurant",
    href: "/food",
    icon: Utensils,
    color: "var(--category-food)",
    detailCtaLabel: "View Details",
    bookCtaLabel: "Subscribe",
  },
  transportation: {
    category: "transportation",
    label: "Transportation",
    singularLabel: "University Ferry",
    href: "/transportation",
    icon: Bus,
    color: "var(--category-transport)",
    detailCtaLabel: "View Details",
    bookCtaLabel: "Book Seat",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
