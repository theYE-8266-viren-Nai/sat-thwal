import { describe, expect, it } from "vitest";
import { createSupabaseMock } from "../../helpers/supabaseMock";
import {
  createFoodPackage,
  foodToCard,
  foodToDetail,
  getFoodItemById,
  getFoodItems,
  getFoodItemsByIds,
  getFoodPackagesForRestaurant,
  groupFoodItemsByRestaurant,
  restaurantToCard,
  updateFoodPackage,
} from "@/lib/queries/food";

const restaurant = {
  id: "restaurant-1",
  owner_profile_id: "owner-1",
  name: "Campus Meals",
  image_url: "image.png",
  township: "Hlaing",
  distance_km: 1.5,
  rating: 4.6,
  verified: true,
  vegetarian_options: true,
  halal: false,
  opening_hours: "7:00 AM - 8:00 PM",
  student_discount_percent: 10,
  created_at: "2026-01-01T00:00:00.000Z",
};

const foodPackage = {
  id: "package-1",
  restaurant_id: "restaurant-1",
  package_type: "breakfast_lunch",
  name: "Breakfast + Lunch",
  monthly_price: 125000,
  max_subscribers: 30,
  is_enabled: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("lib/queries/food", () => {
  it("should fetch enabled food packages and drop rows with missing restaurant joins", async () => {
    const supabase = createSupabaseMock({
      food_packages: { data: [{ ...foodPackage, restaurant }, { ...foodPackage, id: "orphan", restaurant: null }], error: null },
    });

    const result = await getFoodItems(supabase as never);

    expect(result).toEqual([{ package: expect.objectContaining({ id: "package-1" }), restaurant }]);
    expect(supabase.calls).toContainEqual({ table: "food_packages", method: "eq", args: ["is_enabled", true] });
  });

  it("should throw when food package fetch fails", async () => {
    const error = new Error("database unavailable");
    const supabase = createSupabaseMock({ food_packages: { data: null, error } });

    await expect(getFoodItems(supabase as never)).rejects.toThrow(error);
  });

  it("should attach active subscriber counts to restaurant packages", async () => {
    const supabase = createSupabaseMock({
      food_packages: { data: [foodPackage, { ...foodPackage, id: "package-2" }], error: null },
      requests: { data: [{ service_id: "package-1" }, { service_id: "package-1" }], error: null },
    });

    const result = await getFoodPackagesForRestaurant(supabase as never, "restaurant-1");

    expect(result).toEqual([
      expect.objectContaining({ id: "package-1", activeSubscriberCount: 2 }),
      expect.objectContaining({ id: "package-2", activeSubscriberCount: 0 }),
    ]);
  });

  it("should return no package counts when a restaurant has no packages", async () => {
    const supabase = createSupabaseMock({ food_packages: { data: [], error: null } });

    await expect(getFoodPackagesForRestaurant(supabase as never, "restaurant-1")).resolves.toEqual([]);
  });

  it("should create and update food package rows", async () => {
    const supabase = createSupabaseMock({
      food_packages: [
        { data: foodPackage, error: null },
        { data: { ...foodPackage, name: "Updated" }, error: null },
      ],
    });

    await expect(createFoodPackage(supabase as never, foodPackage as never)).resolves.toEqual(foodPackage);
    await expect(updateFoodPackage(supabase as never, "package-1", { name: "Updated" } as never)).resolves.toMatchObject({ name: "Updated" });
    expect(supabase.calls).toContainEqual({ table: "food_packages", method: "insert", args: [foodPackage] });
  });

  it("should return null for missing package detail rows or missing restaurant joins", async () => {
    await expect(getFoodItemById(createSupabaseMock({ food_packages: { data: null, error: null } }) as never, "missing")).resolves.toBeNull();
    await expect(getFoodItemById(createSupabaseMock({ food_packages: { data: { ...foodPackage, restaurant: null }, error: null } }) as never, "orphan")).resolves.toBeNull();
  });

  it("should return an empty array for empty id lookups without querying", async () => {
    const supabase = createSupabaseMock();

    const result = await getFoodItemsByIds(supabase as never, []);

    expect(result).toEqual([]);
    expect(supabase.calls).toEqual([]);
  });

  it("should group packages by restaurant and build food cards/details", () => {
    const item = { package: foodPackage as never, restaurant: restaurant as never };
    const other = { package: { ...foodPackage, id: "package-2", monthly_price: 150000 } as never, restaurant: restaurant as never };

    const groups = groupFoodItemsByRestaurant([item, other]);
    const foodCard = foodToCard(item);
    const restaurantCard = restaurantToCard(groups[0]);
    const detail = foodToDetail(item);

    expect(groups).toHaveLength(1);
    expect(foodCard).toMatchObject({ title: "Breakfast + Lunch", priceLabel: "125,000 MMK / month", ctaLabel: "Request Plan" });
    expect(restaurantCard).toMatchObject({ title: "Campus Meals", priceLabel: "From 125,000 MMK / month" });
    expect(detail.description).toContain("meal support plan");
    expect(detail.amenities).toContain("Vegetarian options");
    expect(detail.amenities).not.toContain("Halal");
  });
});