import Link from "next/link";
import { Bell, Bus, ClipboardList, Route, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardMetricCard,
  DriverHero,
  PassengerPreview,
  RecentActivity,
  TodayRouteCard,
} from "@/components/driver/DriverDashboardOverview";
import { DriverDashboardRequests } from "@/components/driver/DriverDashboardRequests";
import { DriverDashboardError } from "@/components/driver/DriverDashboardError";
import { DriverRouteCard } from "@/components/driver/DriverRouteCard";
import { requireDriverProfile } from "@/lib/driver/auth";
import {
  getDriverNotifications,
  getDriverRegistrations,
  getDriverRoutes,
} from "@/lib/queries/transportationRegistrations";

export default async function DriverDashboardPage() {
  const { supabase, profile, driverProfile } = await requireDriverProfile();
  let routes: Awaited<ReturnType<typeof getDriverRoutes>> = [];
  let registrations: Awaited<ReturnType<typeof getDriverRegistrations>> = [];
  let notifications: Awaited<ReturnType<typeof getDriverNotifications>> = [];

  try {
    [routes, registrations, notifications] = await Promise.all([
      getDriverRoutes(supabase, profile.id),
      getDriverRegistrations(supabase, profile.id),
      getDriverNotifications(supabase, profile.id),
    ]);
  } catch (error) {
    return <DriverDashboardError error={error} />;
  }

  const pendingCount = registrations.filter((item) => item.status === "pending").length;
  const approvedCount = registrations.filter((item) => item.status === "approved").length;
  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const availableSeats = routes.reduce((sum, route) => sum + route.available_seats, 0);
  const approvedByRoute = new Map<string, number>();
  registrations
    .filter((item) => item.status === "approved")
    .forEach((item) => approvedByRoute.set(item.route_id, (approvedByRoute.get(item.route_id) ?? 0) + 1));
  const pendingByRoute = new Map<string, number>();
  registrations
    .filter((item) => item.status === "pending")
    .forEach((item) => pendingByRoute.set(item.route_id, (pendingByRoute.get(item.route_id) ?? 0) + 1));
  const primaryRoute = routes[0];
  const approvedPassengers = registrations.filter((item) => item.status === "approved");
  const displayName = driverProfile.provider_name || profile.full_name || "Driver";

  const stats = [
    { label: "Pending Requests", value: pendingCount, detail: "Waiting for review", icon: ClipboardList, tone: "amber" as const },
    { label: "Approved Students", value: approvedCount, detail: "Confirmed passengers", icon: Users, tone: "green" as const },
    { label: "Available Seats", value: availableSeats, detail: "Across assigned routes", icon: Bus, tone: "teal" as const },
    { label: "Assigned Routes", value: routes.length, detail: "Active UIT routes", icon: Route, tone: "blue" as const },
    { label: "Unread Notifications", value: unreadCount, detail: "Needs attention", icon: Bell, tone: "navy" as const },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <DriverHero driverName={displayName} route={primaryRoute} />

      <section className="grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <DashboardMetricCard key={stat.label} {...stat} />
        ))}
      </section>

      <DriverDashboardRequests registrations={registrations} />

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <TodayRouteCard
          route={primaryRoute}
          approvedPassengers={primaryRoute ? approvedByRoute.get(primaryRoute.id) ?? 0 : 0}
          pendingRequests={primaryRoute ? pendingByRoute.get(primaryRoute.id) ?? 0 : 0}
        />
        <RecentActivity notifications={notifications} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <PassengerPreview passengers={approvedPassengers} />
        <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Assigned Routes</h2>
            <p className="text-sm text-muted-foreground">Routes currently attached to your driver account.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href="/driver/routes">Manage routes</Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {routes.slice(0, 2).length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-5 text-center shadow-sm">
              <p className="text-sm font-medium text-foreground">No assigned routes</p>
              <p className="mt-1 text-sm text-muted-foreground">
                An admin needs to assign transportation routes to this driver account.
              </p>
            </div>
          ) : (
            routes
              .slice(0, 2)
              .map((route) => (
                <DriverRouteCard
                  key={route.id}
                  route={route}
                  approvedPassengers={approvedByRoute.get(route.id) ?? 0}
                  pendingRequests={pendingByRoute.get(route.id) ?? 0}
                />
              ))
          )}
        </div>
        </div>
      </section>
    </div>
  );
}
