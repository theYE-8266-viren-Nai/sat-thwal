import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export interface RestaurantOwnerAccount {
  profileId: string;
  ownerName: string;
  email: string;
  restaurantNames: string[];
}

type RestaurantRow = Database["public"]["Tables"]["restaurants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type AuthUser = {
  id: string;
  email?: string | null;
};

export async function getRestaurantOwnerAccounts(
  supabase: SupabaseClient<Database>,
): Promise<RestaurantOwnerAccount[]> {
  const [restaurantsResult, profilesResult, usersResult] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name, owner_profile_id")
      .not("owner_profile_id", "is", null),
    supabase
      .from("profiles")
      .select("id, full_name")
      .in(
        "id",
        await getRestaurantOwnerIds(supabase),
      ),
    listAllAuthUsers(supabase),
  ]);

  if (restaurantsResult.error) throw restaurantsResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (usersResult.error) throw usersResult.error;

  const restaurants = (restaurantsResult.data ?? []) as RestaurantRow[];
  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const users = usersResult.data;

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const emailById = new Map(
    users.map((user) => [user.id, user.email ?? ""]),
  );
  const grouped = new Map<string, RestaurantOwnerAccount>();

  restaurants.forEach((restaurant) => {
    const ownerId = restaurant.owner_profile_id;
    if (!ownerId) return;
    const profile = profileById.get(ownerId);
    const email = emailById.get(ownerId) ?? "";
    if (!email) return;

    const existing = grouped.get(ownerId);
    const restaurantNames = existing ? existing.restaurantNames : [];
    if (!restaurantNames.includes(restaurant.name)) {
      restaurantNames.push(restaurant.name);
    }

    grouped.set(ownerId, {
      profileId: ownerId,
      ownerName: profile?.full_name ?? "Restaurant owner",
      email,
      restaurantNames,
    });
  });

  return [...grouped.values()].sort((a, b) => a.ownerName.localeCompare(b.ownerName));
}

async function getRestaurantOwnerIds(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("owner_profile_id")
    .not("owner_profile_id", "is", null);
  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.owner_profile_id).filter(Boolean))] as string[];
}

async function listAllAuthUsers(supabase: SupabaseClient<Database>) {
  const users: AuthUser[] = [];
  const pageSize = 100;
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: pageSize });
    if (error) return { data: users, error };

    users.push(...((data.users ?? []) as AuthUser[]));
    if (!data.users || data.users.length < pageSize) break;
    page += 1;
  }

  return { data: users, error: null as null };
}