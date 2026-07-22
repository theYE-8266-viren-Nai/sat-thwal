import Link from "next/link";
import { Bell, ChevronDown } from "lucide-react";
import { DriverMobileDrawer, DriverMobileNav, DriverNav } from "@/components/driver/DriverNav";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDriverNotifications } from "@/lib/queries/transportationRegistrations";
import { requireDriverProfile } from "@/lib/driver/auth";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function initials(name?: string | null) {
  return (name ?? "Driver")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile, driverProfile } = await requireDriverProfile();
  const notifications = await getDriverNotifications(supabase, profile.id);
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const displayName = driverProfile.provider_name || profile.full_name || "Transportation provider";
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DriverNav
        unreadCount={unreadCount}
        driverName={profile.full_name}
        providerName={driverProfile.provider_name}
        vehicleNumber={driverProfile.vehicle_number}
      />
      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <DriverMobileDrawer
                unreadCount={unreadCount}
                driverName={profile.full_name}
                providerName={driverProfile.provider_name}
                vehicleNumber={driverProfile.vehicle_number}
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground md:text-lg">
                  {greeting()}, {displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground md:text-sm">
                  Here is today&apos;s transportation overview. {today}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="icon-touch"
                className="relative rounded-full bg-card shadow-sm ring-1 ring-border"
                aria-label="Driver notifications"
              >
                <Link href="/driver/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-mint px-1 text-[0.65rem] font-semibold text-white motion-safe:animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <details className="group relative hidden sm:block">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full bg-card p-1.5 pr-3 shadow-sm ring-1 ring-border transition hover:shadow-md">
                  <Avatar size="lg">
                    {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
                    <AvatarFallback className="bg-gradient-to-br from-brand-indigo to-brand-indigo-dark text-white">
                      {initials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate text-sm font-medium text-foreground lg:inline">
                    {displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
                </summary>
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl">
                  <Link
                    href="/driver/profile"
                    className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
                  >
                    Driver Profile
                  </Link>
                  <div className="mt-1 border-t border-border pt-2">
                    <LogoutButton redirectTo="/login" />
                  </div>
                </div>
              </details>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-6">{children}</main>
      </div>
      <DriverMobileNav unreadCount={unreadCount} />
    </div>
  );
}
