import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { DriverMobileNav, DriverNav } from "@/components/driver/DriverNav";
import { Button } from "@/components/ui/button";
import { getDriverNotifications } from "@/lib/queries/transportationRegistrations";
import { requireDriverProfile } from "@/lib/driver/auth";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireDriverProfile();
  const notifications = await getDriverNotifications(supabase, profile.id);
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  if (profile.role !== "driver" && profile.role !== "admin") redirect("/home");

  return (
    <div className="flex min-h-screen bg-background">
      <DriverNav unreadCount={unreadCount} />
      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Driver Panel
              </p>
              <h1 className="text-xl font-semibold text-foreground">
                {profile.full_name ?? "Transportation provider"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="icon-touch"
                className="relative rounded-full"
                aria-label="Driver notifications"
              >
                <Link href="/driver/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-mint" />
                  )}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/home">Student app</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="px-5 py-6 md:px-8">{children}</main>
      </div>
      <DriverMobileNav unreadCount={unreadCount} />
    </div>
  );
}
