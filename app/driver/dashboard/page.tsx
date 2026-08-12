import { Bus, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DriverDashboardError } from "@/components/driver/DriverDashboardError";
import { DriverTransportationRequestsList } from "@/components/driver/DriverTransportationRequestsList";
import { requireDriverProfile } from "@/lib/driver/auth";
import {
  getDriverRegistrations,
  getDriverRoutes,
} from "@/lib/queries/transportationRegistrations";
import { formatTime } from "@/lib/queries/transportation";
import { formatMMK } from "@/lib/utils";

export default async function DriverDashboardPage() {
  const { supabase, profile } = await requireDriverProfile();
  let routes: Awaited<ReturnType<typeof getDriverRoutes>> = [];
  let registrations: Awaited<ReturnType<typeof getDriverRegistrations>> = [];

  try {
    [routes, registrations] = await Promise.all([
      getDriverRoutes(supabase, profile.id),
      getDriverRegistrations(supabase, profile.id),
    ]);
  } catch (error) {
    return <DriverDashboardError error={error} />;
  }

  const approvedByRoute = new Map<string, number>();
  registrations
    .filter((item) => item.status === "confirmed")
    .forEach((item) => approvedByRoute.set(item.service_id, (approvedByRoute.get(item.service_id) ?? 0) + 1));
  const pendingByRoute = new Map<string, number>();
  registrations
    .filter((item) => item.status === "pending")
    .forEach((item) => pendingByRoute.set(item.service_id, (pendingByRoute.get(item.service_id) ?? 0) + 1));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <section>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Transportation Overview
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground md:text-2xl">Assigned routes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review route details and respond to student seat requests.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {routes.length === 0 ? (
          <Card className="border-dashed p-6 text-center">
            <p className="text-sm font-medium text-foreground">No assigned routes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              An admin needs to assign transportation routes to this driver account.
            </p>
          </Card>
        ) : (
          routes.map((route) => (
            <Card key={route.id} className="gap-3 rounded-xl border-border bg-card p-3 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{route.route_name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {route.pickup_township} to UIT
                  </p>
                </div>
                <Badge className="h-6 rounded-full bg-brand-mint/15 px-2 text-[0.7rem] text-emerald-700">
                  {route.available_seats} seats open
                </Badge>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-brand-mint" />
                  {route.vehicle_type ?? "Vehicle"} {route.vehicle_number ?? ""}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-brand-mint" />
                  {approvedByRoute.get(route.id) ?? 0} approved
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-mint" />
                  Depart {formatTime(route.departure_time)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-mint" />
                  Return {formatTime(route.return_time)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-secondary px-2.5 py-1">
                  {pendingByRoute.get(route.id) ?? 0} pending
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1">
                  {formatMMK(route.monthly_price)} / month
                </span>
              </div>
            </Card>
          ))
        )}
      </section>

      <DriverTransportationRequestsList requests={registrations} />
    </div>
  );
}
