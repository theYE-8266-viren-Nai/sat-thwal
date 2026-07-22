import Link from "next/link";
import { Bell, Bus, ClipboardList, Eye, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DriverRouteCard } from "@/components/driver/DriverRouteCard";
import { RegistrationStatusActions } from "@/components/driver/RegistrationStatusActions";
import { requireDriverProfile } from "@/lib/driver/auth";
import {
  getDriverNotifications,
  getDriverRegistrations,
  getDriverRoutes,
} from "@/lib/queries/transportationRegistrations";

export default async function DriverDashboardPage() {
  const { supabase, profile } = await requireDriverProfile();
  const [routes, registrations, notifications] = await Promise.all([
    getDriverRoutes(supabase, profile.id),
    getDriverRegistrations(supabase, profile.id),
    getDriverNotifications(supabase, profile.id),
  ]);

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

  const stats = [
    { label: "Assigned routes", value: routes.length, icon: Bus },
    { label: "Pending requests", value: pendingCount, icon: ClipboardList },
    { label: "Approved students", value: approvedCount, icon: Users },
    { label: "Seats available", value: availableSeats, icon: Bell },
    { label: "Unread notifications", value: unreadCount, icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review new seat requests and monitor your assigned UIT routes.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Icon className="h-4 w-4 text-brand-mint" />
              </div>
              <strong className="text-2xl font-semibold text-foreground">{stat.value}</strong>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="gap-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground">Recent seat requests</h3>
              <p className="text-sm text-muted-foreground">Approve or reject pending registrations.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/driver/registrations">View all</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {registrations.slice(0, 5).length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No seat requests yet.
              </p>
            ) : (
              registrations.slice(0, 5).map((registration) => (
                <div key={registration.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-brand-indigo">
                        {(registration.student?.full_name ?? "S").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">
                            {registration.student?.full_name ?? "Student"}
                          </p>
                          <Badge variant="secondary">{registration.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {registration.pickup_stop_name}
                          {registration.pickup_time ? `, ${registration.pickup_time}` : ""} -{" "}
                          {registration.route?.route_name ?? "Route"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {registration.pickup_address}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/driver/registrations?registration=${registration.id}`}>
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <RegistrationStatusActions
                        registrationId={registration.id}
                        status={registration.status}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="gap-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">{unreadCount} unread updates</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/driver/notifications">Open</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 4).length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              notifications.slice(0, 4).map((notification) => (
                <div key={notification.id} className="rounded-lg bg-secondary p-3">
                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">Assigned routes</h3>
            <p className="text-sm text-muted-foreground">Routes currently attached to your driver account.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/driver/routes">Manage routes</Link>
          </Button>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {routes.slice(0, 2).length === 0 ? (
            <Card className="border-dashed p-8 text-center xl:col-span-2">
              <p className="text-sm font-medium text-foreground">No assigned routes</p>
              <p className="mt-1 text-sm text-muted-foreground">
                An admin needs to assign transportation routes to this driver account.
              </p>
            </Card>
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
      </section>
    </div>
  );
}
