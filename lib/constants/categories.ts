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
    label: "Academic Support",
    singularLabel: "Approved Tutor",
    href: "/tutors",
    icon: BookOpen,
    color: "var(--category-tutor)",
    detailCtaLabel: "View Support",
    bookCtaLabel: "Request Session",
  },
  hostel: {
    category: "hostel",
    label: "Student Housing",
    singularLabel: "Approved Housing",
    href: "/hostels",
    icon: Building2,
    color: "var(--category-hostel)",
    detailCtaLabel: "View Housing",
    bookCtaLabel: "Request Room",
  },
  food: {
    category: "food",
    label: "Meal Support",
    singularLabel: "Approved Meal Plan",
    href: "/food",
    icon: Utensils,
    color: "var(--category-food)",
    detailCtaLabel: "View Details",
    bookCtaLabel: "Request Plan",
  },
  transportation: {
    category: "transportation",
    label: "Campus Transport",
    singularLabel: "Approved Ferry Route",
    href: "/transportation",
    icon: Bus,
    color: "var(--category-transport)",
    detailCtaLabel: "View Details",
    bookCtaLabel: "Request Seat",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
