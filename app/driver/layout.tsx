import { LogoutButton } from "@/components/profile/LogoutButton";
import { ProviderRegistrationGate } from "@/components/provider/ProviderRegistrationGate";
import { requireDriverProfile } from "@/lib/driver/auth";
import { getProviderRegistrationWithPayment } from "@/lib/queries/providerRegistrations";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile, driverProfile } = await requireDriverProfile();
  const registrationState = await getProviderRegistrationWithPayment(
    supabase,
    profile.id,
    "transportation",
  );
  const displayName = driverProfile.provider_name || profile.full_name || "Transportation provider";
  const isActive = registrationState.registration?.status === "active";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Driver Panel
            </p>
            <h1 className="truncate text-lg font-semibold text-foreground">
              {displayName}
            </h1>
          </div>
          <div className="w-full sm:w-40">
            <LogoutButton redirectTo="/login" />
          </div>
        </div>
      </header>
      <main className="px-4 py-5 md:px-6">
        {isActive ? (
          children
        ) : (
          <ProviderRegistrationGate
            providerType="transportation"
            registration={registrationState.registration}
            payment={registrationState.payment}
          />
        )}
      </main>
    </div>
  );
}
