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
  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{route.route_name}</h3>
            <Badge variant="secondary">{route.vehicle_type ?? "Vehicle"}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Vehicle number: {route.vehicle_number ?? "Not added"}
          </p>
        </div>
        <Badge className="bg-brand-mint text-white">
          {route.available_seats} seats open
        </Badge>
      </div>

      <RouteTimeline stops={getRouteStops(route)} compact />

      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
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
        <span className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
          <Bus className="h-4 w-4 text-brand-mint" />
          {route.pickup_township} to UIT - {pendingRequests} pending requests
        </span>
      </div>
    </Card>
  );
}
