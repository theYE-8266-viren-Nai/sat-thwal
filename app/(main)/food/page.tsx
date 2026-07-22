"use client";

import { ServiceListingPage } from "@/components/services/ServiceListingPage";
import { ServiceSection } from "@/components/home/ServiceSection";
import { getFoodItems, foodToCard, type FoodItem } from "@/lib/queries/food";
import { formatDistance, formatMMK, isOpenNow } from "@/lib/utils";
import type { FilterFieldConfig, ServiceCardData } from "@/types/domain";

function groupByRestaurant(items: FoodItem[]): FoodItem[][] {
  const groups = new Map<string, FoodItem[]>();
  for (const item of items) {
    const group = groups.get(item.restaurant.id);
    if (group) group.push(item);
    else groups.set(item.restaurant.id, [item]);
  }
  return [...groups.values()];
}

function restaurantToCard(group: FoodItem[]): ServiceCardData {
  const { restaurant } = group[0];
  const cheapest = group.reduce((min, i) => (i.meal.price < min.meal.price ? i : min));

  return {
    id: cheapest.meal.id,
    category: "food",
    image: restaurant.image_url,
    title: restaurant.name,
    subtitle: restaurant.township,
    priceLabel: `From ${formatMMK(cheapest.meal.price)}`,
    rating: restaurant.rating,
    verified: false,
    meta: [
      { icon: "map-pin", label: `${restaurant.township} · ${formatDistance(restaurant.distance_km)}` },
      {
        icon: "utensils",
        label: [restaurant.delivery && "Delivery", restaurant.pickup && "Pickup"]
          .filter(Boolean)
          .join(" · "),
      },
      ...(restaurant.student_discount_percent
        ? [{ icon: "wallet" as const, label: `${restaurant.student_discount_percent}% student discount` }]
        : []),
    ],
    ctaLabel: "View menu",
    href: `/services/food/${cheapest.meal.id}`,
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
      emptyMessage="No meal plans match your filters yet. Try widening your search."
      hideMainList
      renderSections={({ filteredRows, profileId, savedKeys, loading }) => {
        if (loading || !profileId) return null;

        const restaurantGroups = groupByRestaurant(filteredRows).sort(
          (a, b) => b[0].restaurant.rating - a[0].restaurant.rating
        );
        const allMealPlans = restaurantGroups.map(restaurantToCard);
        const vegetarianMealPlans = restaurantGroups
          .filter((g) => g[0].restaurant.vegetarian_options)
          .map(restaurantToCard);
        const halalMealPlans = restaurantGroups.filter((g) => g[0].restaurant.halal).map(restaurantToCard);

        return (
          <>
            <ServiceSection
              title="All meal plans"
              items={allMealPlans}
              profileId={profileId}
              savedKeys={savedKeys}
            />
            <ServiceSection
              title="Vegetarian meal plans"
              items={vegetarianMealPlans}
              profileId={profileId}
              savedKeys={savedKeys}
            />
            <ServiceSection
              title="Halal meal plans"
              items={halalMealPlans}
              profileId={profileId}
              savedKeys={savedKeys}
            />
          </>
        );
      }}
    />
  );
}
