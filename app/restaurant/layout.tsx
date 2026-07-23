import { requireRestaurantProfile } from "@/lib/restaurant/auth";
import { getRestaurantByOwner } from "@/lib/queries/food";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { ProviderRegistrationGate } from "@/components/provider/ProviderRegistrationGate";
import { getProviderRegistrationWithPayment } from "@/lib/queries/providerRegistrations";

export default async function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireRestaurantProfile();
  const [restaurant, registrationState] = await Promise.all([
    getRestaurantByOwner(supabase, profile.id),
    getProviderRegistrationWithPayment(supabase, profile.id, "restaurant"),
  ]);
  const isActive = registrationState.registration?.status === "active";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Restaurant Panel
            </p>
            <h1 className="text-xl font-semibold text-foreground">
              {restaurant?.name ?? "Restaurant"}
            </h1>
          </div>
          <div className="w-40">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="px-5 py-6 md:px-8">
        {isActive ? (
          children
        ) : (
          <ProviderRegistrationGate
            providerType="restaurant"
            registration={registrationState.registration}
            payment={registrationState.payment}
          />
        )}
      </main>
    </div>
  );
}
