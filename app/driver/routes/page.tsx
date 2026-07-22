import { MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DriverRouteCard } from "@/components/driver/DriverRouteCard";
import { requireDriverProfile } from "@/lib/driver/auth";
import {
  getDriverRegistrations,
  getDriverRoutes,
} from "@/lib/queries/transportationRegistrations";

export default async function DriverRoutesPage() {
  const { supabase, profile } = await requireDriverProfile();
  const [routes, registrations] = await Promise.all([
    getDriverRoutes(supabase, profile.id),
    getDriverRegistrations(supabase, profile.id),
  ]);

  const approvedByRoute = new Map<string, typeof registrations>();
  const pendingByRoute = new Map<string, number>();
  registrations
    .filter((registration) => registration.status === "confirmed")
    .forEach((registration) => {
      const routeRegistrations = approvedByRoute.get(registration.service_id) ?? [];
      approvedByRoute.set(registration.service_id, [...routeRegistrations, registration]);
    });
  registrations
    .filter((registration) => registration.status === "pending")
    .forEach((registration) =>
      pendingByRoute.set(
        registration.service_id,
        (pendingByRoute.get(registration.service_id) ?? 0) + 1,
      ),
    );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-foreground">My routes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View assigned vehicles, ordered pickup stops, seat counts, and approved students.
        </p>
      </section>

      <div className="space-y-5">
        {routes.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <p className="text-sm font-medium text-foreground">No routes assigned yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask an admin to assign UIT transportation routes to your driver account.
            </p>
          </Card>
        ) : (
          routes.map((route) => {
            const approvedPassengers = approvedByRoute.get(route.id) ?? [];

            return (
              <section key={route.id} className="space-y-3">
                <DriverRouteCard
                  route={route}
                  approvedPassengers={approvedPassengers.length}
                  pendingRequests={pendingByRoute.get(route.id) ?? 0}
                />
                <Card className="gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Approved passengers</h3>
                    <Badge variant="secondary">{approvedPassengers.length}</Badge>
                  </div>
                  {approvedPassengers.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                      No approved passengers for this route yet.
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {approvedPassengers.map((registration) => (
                        <div key={registration.id} className="rounded-lg border border-border p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">
                              {registration.student?.full_name ?? "Student"}
                            </p>
                            <Badge variant="secondary">{registration.status}</Badge>
                          </div>
                          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 h-4 w-4 text-brand-mint" />
                            <span>
                              {registration.pickup_stop_name}
                              {registration.pickup_time ? `, ${registration.pickup_time}` : ""}
                              <span className="block">{registration.pickup_address}</span>
                            </span>
                          </p>
                          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 text-brand-mint" />
                            {registration.student?.phone ?? "No phone added"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
