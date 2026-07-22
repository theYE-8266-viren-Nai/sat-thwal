import { Bus, Clock, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RouteTimeline } from "@/components/transportation/RouteTimeline";
import {
  formatTime,
  getRouteStops,
  type TransportationRow,
} from "@/lib/queries/transportation";
import { formatMMK } from "@/lib/utils";

interface DriverRouteCardProps {
  route: TransportationRow;
  approvedPassengers: number;
  pendingRequests?: number;
}

export function DriverRouteCard({
  route,
  approvedPassengers,
  pendingRequests = 0,
}: DriverRouteCardProps) {
  const usedSeats = Math.max(route.total_seats - route.available_seats, 0);
  const capacity = route.total_seats > 0 ? Math.min(100, Math.round((usedSeats / route.total_seats) * 100)) : 0;

  return (
    <Card className="rounded-xl border-border bg-card p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{route.route_name}</h3>
            <Badge className="bg-brand-indigo/10 text-brand-indigo">{route.vehicle_type ?? "Vehicle"}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Vehicle number: {route.vehicle_number ?? "Not added"}
          </p>
        </div>
        <Badge className="bg-brand-mint/15 text-emerald-700">
          {route.available_seats} seats open
        </Badge>
      </div>

      <div className="rounded-xl bg-secondary/60 p-3">
        <RouteTimeline stops={getRouteStops(route)} compact />
      </div>

      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-mint" />
          Depart {formatTime(route.departure_time)}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-mint" />
          Return {formatTime(route.return_time)}
        </span>
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-mint" />
          {approvedPassengers} approved / {route.total_seats} total
        </span>
        <span className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-brand-mint" />
          {formatMMK(route.monthly_price)} / month
        </span>
        <span className="flex items-center gap-2 sm:col-span-2">
          <Bus className="h-4 w-4 text-brand-mint" />
          {route.pickup_township} to UIT - {pendingRequests} pending requests
        </span>
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
          <span>Capacity</span>
          <span>{usedSeats}/{route.total_seats}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-indigo to-brand-mint" style={{ width: `${capacity}%` }} />
        </div>
      </div>
    </Card>
  );
}
