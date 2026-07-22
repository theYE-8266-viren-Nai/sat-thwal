import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ServiceCardData } from "@/types/domain";
import type { ServiceDetailData } from "@/types/detail";
import { formatDistance, formatMMK } from "@/lib/utils";

export type RestaurantRow = Database["public"]["Tables"]["restaurants"]["Row"];
export type MealRow = Database["public"]["Tables"]["meals"]["Row"];

export interface FoodItem {
  meal: MealRow;
  restaurant: RestaurantRow;
}

type RawMealWithRestaurant = MealRow & { restaurant: RestaurantRow | null };

export async function getFoodItems(supabase: SupabaseClient<Database>): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from("meals")
    .select("*, restaurant:restaurants(*)")
    .order("price", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as unknown as RawMealWithRestaurant[];
  return rows
    .filter((row) => row.restaurant)
    .map((row) => ({ meal: row, restaurant: row.restaurant as RestaurantRow }));
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

export async function getFoodItemById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<FoodItem | null> {
  const { data, error } = await supabase
    .from("meals")
    .select("*, restaurant:restaurants(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  const row = data as unknown as RawMealWithRestaurant | null;
  if (!row || !row.restaurant) return null;
  return { meal: row, restaurant: row.restaurant };
}

export async function getFoodItemsByIds(
  supabase: SupabaseClient<Database>,
  ids: string[],
): Promise<FoodItem[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("meals")
    .select("*, restaurant:restaurants(*)")
    .in("id", ids);
  if (error) throw error;
  const rows = (data ?? []) as unknown as RawMealWithRestaurant[];
  return rows
    .filter((row) => row.restaurant)
    .map((row) => ({ meal: row, restaurant: row.restaurant as RestaurantRow }));
}

export function foodToCard({ meal, restaurant }: FoodItem): ServiceCardData {
  return {
    id: meal.id,
    category: "food",
    image: meal.image_url ?? restaurant.image_url,
    title: meal.name,
    subtitle: restaurant.name,
    priceLabel: formatMMK(meal.price),
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
    ctaLabel: "Order",
    href: `/services/food/${meal.id}`,
  };
}

export function foodToDetail({ meal, restaurant }: FoodItem): ServiceDetailData {
  const fulfillment = [restaurant.delivery && "Delivery", restaurant.pickup && "Pickup"]
    .filter(Boolean)
    .join(" · ");

  return {
    id: meal.id,
    category: "food",
    image: meal.image_url ?? restaurant.image_url,
    title: meal.name,
    providerName: restaurant.name,
    providerAvatar: restaurant.image_url,
    verified: false,
    rating: restaurant.rating,
    priceLabel: formatMMK(meal.price),
    availabilityLines: [restaurant.opening_hours ?? "Hours unavailable", fulfillment || "Dine-in only"],
    locationLabel: `${restaurant.township}, ${formatDistance(restaurant.distance_km)}`,
    description: `${meal.name} from ${restaurant.name}, ${restaurant.township}.${
      restaurant.student_discount_percent ? ` Students get ${restaurant.student_discount_percent}% off.` : ""
    }`,
    amenities: [
      restaurant.vegetarian_options && "Vegetarian options",
      restaurant.halal && "Halal",
      meal.is_student_package && "Student meal package",
    ].filter((v): v is string => Boolean(v)),
    ctaLabel: "Order",
    contactInfo: "Message via Sat Thwal to place your order with this restaurant.",
  };
}
