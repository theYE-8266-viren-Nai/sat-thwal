"use client";

import { ServiceListingPage } from "@/components/services/ServiceListingPage";
import { ServiceSection } from "@/components/home/ServiceSection";
import { getFoodItems, foodToCard, type FoodItem } from "@/lib/queries/food";
import { formatMMK, isOpenNow } from "@/lib/utils";
import type { FilterFieldConfig, ServiceCardData } from "@/types/domain";

function uniqueRestaurants(items: FoodItem[]): FoodItem[] {
  const seen = new Set<string>();
  const result: FoodItem[] = [];
  for (const item of items) {
    if (seen.has(item.restaurant.id)) continue;
    seen.add(item.restaurant.id);
    result.push(item);
  }
  return result;
}

function restaurantToCard(item: FoodItem): ServiceCardData {
  return {
    ...foodToCard(item),
    title: item.restaurant.name,
    subtitle: item.meal.name,
  };
}

const FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "price", label: "Price range (MMK)", type: "range", min: 0, max: 6000, step: 500 },
  { key: "distance", label: "Distance (km)", type: "range", min: 0, max: 3, step: 0.5 },
  {
    key: "fulfillment",
    label: "Delivery or pickup",
    type: "select",
    options: [
      { label: "Delivery", value: "delivery" },
      { label: "Pickup", value: "pickup" },
    ],
  },
  { key: "vegetarian", label: "Vegetarian", type: "toggle" },
  { key: "halal", label: "Halal", type: "toggle" },
  { key: "studentPackage", label: "Student meal packages", type: "toggle" },
  { key: "openNow", label: "Open now", type: "toggle" },
];

export default function FoodPage() {
  return (
    <ServiceListingPage<FoodItem>
      title="Find Food"
      searchPlaceholder="Search restaurants, meals..."
      filterFields={FILTER_FIELDS}
      formatRangeValue={(n) => (n < 100 ? `${n} km` : formatMMK(n))}
      fetchRows={getFoodItems}
      toCard={foodToCard}
      matchesSearch={({ meal, restaurant }, query) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return meal.name.toLowerCase().includes(q) || restaurant.name.toLowerCase().includes(q);
      }}
      applyFilters={({ meal, restaurant }, filters) => {
        if (filters.price) {
          const [lo, hi] = filters.price as [number, number];
          if (meal.price < lo || meal.price > hi) return false;
        }
        if (filters.distance) {
          const [lo, hi] = filters.distance as [number, number];
          if (restaurant.distance_km < lo || restaurant.distance_km > hi) return false;
        }
        if (filters.fulfillment === "delivery" && !restaurant.delivery) return false;
        if (filters.fulfillment === "pickup" && !restaurant.pickup) return false;
        if (filters.vegetarian && !restaurant.vegetarian_options) return false;
        if (filters.halal && !restaurant.halal) return false;
        if (filters.studentPackage && !meal.is_student_package) return false;
        if (filters.openNow && !isOpenNow(restaurant.opening_hours)) return false;
        return true;
      }}
      emptyMessage="No meals match your filters yet. Try widening your search."
      listHeading="All meals"
      listVariant="compact"
      renderSections={({ rows, profileId, savedKeys, loading }) => {
        if (loading || !profileId) return null;

        const byRating = [...rows].sort((a, b) => b.restaurant.rating - a.restaurant.rating);
        const popularMeals = byRating.slice(0, 10).map(foodToCard);
        const popularRestaurants = uniqueRestaurants(byRating).slice(0, 10).map(restaurantToCard);
        const popularVegetarian = uniqueRestaurants(byRating.filter((i) => i.restaurant.vegetarian_options))
          .slice(0, 10)
          .map(restaurantToCard);
        const popularHalal = uniqueRestaurants(byRating.filter((i) => i.restaurant.halal))
          .slice(0, 10)
          .map(restaurantToCard);

        return (
          <>
            <ServiceSection
              title="Popular meals"
              items={popularMeals}
              profileId={profileId}
              savedKeys={savedKeys}
            />
            <ServiceSection
              title="Popular restaurants"
              items={popularRestaurants}
              profileId={profileId}
              savedKeys={savedKeys}
            />
            <ServiceSection
              title="Popular vegetarian restaurants"
              items={popularVegetarian}
              profileId={profileId}
              savedKeys={savedKeys}
            />
            <ServiceSection
              title="Popular halal restaurants"
              items={popularHalal}
              profileId={profileId}
              savedKeys={savedKeys}
            />
          </>
        );
      }}
    />
  );
}
