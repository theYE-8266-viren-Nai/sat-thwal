import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, FoodPackageType } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";
import type { ServiceDetailData } from "@/types/detail";
import { formatDistance, formatMMK } from "@/lib/utils";

export type RestaurantRow = Database["public"]["Tables"]["restaurants"]["Row"];
export type FoodPackageRow = Database["public"]["Tables"]["food_packages"]["Row"];

export const FOOD_PACKAGE_LABELS: Record<FoodPackageType, string> = {
  breakfast_lunch_dinner: "Breakfast + Lunch + Dinner",
  breakfast_lunch: "Breakfast + Lunch",
  breakfast_dinner: "Breakfast + Dinner",
  lunch_dinner: "Lunch + Dinner",
};

export const FOOD_PACKAGE_TYPES = Object.keys(FOOD_PACKAGE_LABELS) as FoodPackageType[];

export interface FoodItem {
  package: FoodPackageRow;
  restaurant: RestaurantRow;
}

export interface FoodPackageWithSubscriberCount extends FoodPackageRow {
  activeSubscriberCount: number;
}

type RawPackageWithRestaurant = FoodPackageRow & { restaurant: RestaurantRow | null };

function normalizeFoodPackages(rows: RawPackageWithRestaurant[]): FoodItem[] {
  return rows
    .filter((row) => row.restaurant)
    .map((row) => ({ package: row, restaurant: row.restaurant as RestaurantRow }));
}

export async function getFoodItems(supabase: SupabaseClient<Database>): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from("food_packages")
    .select("*, restaurant:restaurants(*)")
    .eq("is_enabled", true)
    .order("monthly_price", { ascending: true });
  if (error) throw error;
  return normalizeFoodPackages((data ?? []) as unknown as RawPackageWithRestaurant[]);
}

export async function getRestaurantByOwner(supabase: SupabaseClient<Database>, profileId: string) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFoodPackagesForRestaurant(
  supabase: SupabaseClient<Database>,
  restaurantId: string,
): Promise<FoodPackageWithSubscriberCount[]> {
  const { data: packages, error } = await supabase
    .from("food_packages")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("package_type", { ascending: true });
  if (error) throw error;

  if (!packages?.length) return [];

  const packageIds = packages.map((item) => item.id);
  const { data: requests, error: requestError } = await supabase
    .from("requests")
    .select("service_id")
    .eq("service_type", "food")
    .eq("status", "confirmed")
    .in("service_id", packageIds);
  if (requestError) throw requestError;

  const counts = new Map<string, number>();
  (requests ?? []).forEach((request) => {
    counts.set(request.service_id, (counts.get(request.service_id) ?? 0) + 1);
  });

  return packages.map((item) => ({
    ...item,
    activeSubscriberCount: counts.get(item.id) ?? 0,
  }));
}

export async function createFoodPackage(
  supabase: SupabaseClient<Database>,
  payload: Database["public"]["Tables"]["food_packages"]["Insert"],
) {
  const { data, error } = await supabase
    .from("food_packages")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateFoodPackage(
  supabase: SupabaseClient<Database>,
  packageId: string,
  updates: Database["public"]["Tables"]["food_packages"]["Update"],
) {
  const { data, error } = await supabase
    .from("food_packages")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", packageId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getFoodItemById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<FoodItem | null> {
  const { data, error } = await supabase
    .from("food_packages")
    .select("*, restaurant:restaurants(*)")
    .eq("id", id)
    .eq("is_enabled", true)
    .maybeSingle();
  if (error) throw error;
  const row = data as unknown as RawPackageWithRestaurant | null;
  if (!row || !row.restaurant) return null;
  return { package: row, restaurant: row.restaurant };
}

export async function getFoodItemsByIds(
  supabase: SupabaseClient<Database>,
  ids: string[],
): Promise<FoodItem[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("food_packages")
    .select("*, restaurant:restaurants(*)")
    .in("id", ids);
  if (error) throw error;
  return normalizeFoodPackages((data ?? []) as unknown as RawPackageWithRestaurant[]);
}

function packageMealLabel(packageType: FoodPackageType) {
  return FOOD_PACKAGE_LABELS[packageType].split(" + ").join(", ");
}

export function foodToCard({ package: foodPackage, restaurant }: FoodItem): ServiceCardData {
  return {
    id: foodPackage.id,
    category: "food",
    image: restaurant.image_url,
    title: foodPackage.name,
    subtitle: restaurant.name,
    priceLabel: `${formatMMK(foodPackage.monthly_price)} / month`,
    rating: restaurant.rating,
    verified: restaurant.verified,
    meta: [
      { icon: "map-pin", label: `${restaurant.township} · ${formatDistance(restaurant.distance_km)}` },
      { icon: "utensils", label: packageMealLabel(foodPackage.package_type) },
      { icon: "users", label: `${foodPackage.max_subscribers} subscriber capacity` },
    ],
    ctaLabel: "Subscribe",
    href: `/services/food/${foodPackage.id}`,
  };
}

export function groupFoodItemsByRestaurant(items: FoodItem[]): FoodItem[][] {
  const groups = new Map<string, FoodItem[]>();
  for (const item of items) {
    const group = groups.get(item.restaurant.id);
    if (group) group.push(item);
    else groups.set(item.restaurant.id, [item]);
  }
  return [...groups.values()];
}

export function restaurantToCard(group: FoodItem[]): ServiceCardData {
  const { restaurant } = group[0];
  const cheapest = group.reduce((min, item) =>
    item.package.monthly_price < min.package.monthly_price ? item : min,
  );

  return {
    id: cheapest.package.id,
    category: "food",
    image: restaurant.image_url,
    title: restaurant.name,
    subtitle: restaurant.township,
    priceLabel: `From ${formatMMK(cheapest.package.monthly_price)} / month`,
    rating: restaurant.rating,
    verified: restaurant.verified,
    meta: [
      { icon: "map-pin", label: `${restaurant.township} · ${formatDistance(restaurant.distance_km)}` },
      { icon: "utensils", label: `${group.length} monthly packages` },
      ...(restaurant.student_discount_percent
        ? [{ icon: "wallet" as const, label: `${restaurant.student_discount_percent}% student discount` }]
        : []),
    ],
    ctaLabel: "View packages",
    href: `/services/food/${cheapest.package.id}`,
  };
}

export function foodToDetail({ package: foodPackage, restaurant }: FoodItem): ServiceDetailData {
  const packageLabel = FOOD_PACKAGE_LABELS[foodPackage.package_type];

  return {
    id: foodPackage.id,
    category: "food",
    image: restaurant.image_url,
    title: foodPackage.name,
    providerName: restaurant.name,
    providerAvatar: restaurant.image_url,
    verified: restaurant.verified,
    rating: restaurant.rating,
    priceLabel: `${formatMMK(foodPackage.monthly_price)} / month`,
    availabilityLines: [restaurant.opening_hours ?? "Hours unavailable", "Monthly food subscription"],
    locationLabel: `${restaurant.township}, ${formatDistance(restaurant.distance_km)}`,
    description: `${foodPackage.name} is a monthly ${packageLabel.toLowerCase()} subscription from ${restaurant.name}. Students subscribe to the package and do not choose individual dishes.`,
    amenities: [
      packageLabel,
      `${foodPackage.max_subscribers} subscriber capacity`,
      restaurant.vegetarian_options && "Vegetarian options",
      restaurant.halal && "Halal",
    ].filter((v): v is string => Boolean(v)),
    ctaLabel: "Subscribe",
    contactInfo: "Subscribe through Set Thwal. The restaurant will confirm availability for this monthly package.",
    ownerProfileId: restaurant.owner_profile_id,
  };
}
