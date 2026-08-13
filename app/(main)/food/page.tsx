"use client";

import { ServiceListingPage } from "@/components/services/ServiceListingPage";
import { ServiceSection } from "@/components/home/ServiceSection";
import { ServiceSectionSkeleton } from "@/components/services/ServiceCardSkeleton";
import {
  FOOD_PACKAGE_LABELS,
  getFoodItems,
  foodToCard,
  groupFoodItemsByRestaurant,
  restaurantToCard,
  type FoodItem,
} from "@/lib/queries/food";
import { formatMMK, isOpenNow } from "@/lib/utils";
import type { FilterFieldConfig } from "@/types/domain";

const FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "price", label: "Monthly price (MMK)", type: "range", min: 0, max: 250000, step: 5000 },
  { key: "distance", label: "Distance (km)", type: "range", min: 0, max: 3, step: 0.5 },
  {
    key: "packageType",
    label: "Package type",
    type: "select",
    options: Object.entries(FOOD_PACKAGE_LABELS).map(([value, label]) => ({ label, value })),
  },
  { key: "vegetarian", label: "Vegetarian", type: "toggle" },
  { key: "halal", label: "Halal", type: "toggle" },
  { key: "openNow", label: "Open now", type: "toggle" },
];

export default function FoodPage() {
  return (
    <ServiceListingPage<FoodItem>
      category="food"
      title="Meal Support"
      searchPlaceholder="Search approved meal plans or kitchens..."
      filterFields={FILTER_FIELDS}
      formatRangeValue={(n) => (n < 100 ? `${n} km` : formatMMK(n))}
      fetchRows={getFoodItems}
      toCard={foodToCard}
      matchesSearch={({ package: foodPackage, restaurant }, query) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return foodPackage.name.toLowerCase().includes(q) || restaurant.name.toLowerCase().includes(q);
      }}
      applyFilters={({ package: foodPackage, restaurant }, filters) => {
        if (filters.price) {
          const [lo, hi] = filters.price as [number, number];
          if (foodPackage.monthly_price < lo || foodPackage.monthly_price > hi) return false;
        }
        if (filters.distance) {
          const [lo, hi] = filters.distance as [number, number];
          if (restaurant.distance_km < lo || restaurant.distance_km > hi) return false;
        }
        if (filters.packageType && foodPackage.package_type !== filters.packageType) return false;
        if (filters.vegetarian && !restaurant.vegetarian_options) return false;
        if (filters.halal && !restaurant.halal) return false;
        if (filters.openNow && !isOpenNow(restaurant.opening_hours)) return false;
        return true;
      }}
      emptyMessage="No approved monthly meal plans match your filters yet. Try widening your search."
      hideMainList
      renderSections={({ filteredRows, profileId, loading }) => {
        if (loading || !profileId) {
          return (
            <>
              <ServiceSectionSkeleton title="All approved meal plans" />
              <ServiceSectionSkeleton title="Vegetarian-friendly meal plans" />
            </>
          );
        }

        const restaurantGroups = groupFoodItemsByRestaurant(filteredRows).sort(
          (a, b) => b[0].restaurant.rating - a[0].restaurant.rating
        );
        const allPackages = restaurantGroups.map(restaurantToCard);
        const vegetarianPackages = restaurantGroups
          .filter((g) => g[0].restaurant.vegetarian_options)
          .map(restaurantToCard);
        const halalPackages = restaurantGroups.filter((g) => g[0].restaurant.halal).map(restaurantToCard);

        return (
          <>
            <ServiceSection title="All approved meal plans" items={allPackages} />
            <ServiceSection title="Vegetarian-friendly meal plans" items={vegetarianPackages} />
            <ServiceSection title="Halal-friendly meal plans" items={halalPackages} />
          </>
        );
      }}
    />
  );
}
