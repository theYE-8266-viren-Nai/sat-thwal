import Link from "next/link";
import {
  Bell,
  Bus,
  CalendarClock,
  Clock,
  MapPinned,
  Route,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RouteTimeline } from "@/components/transportation/RouteTimeline";
import {
  formatTime,
  getRouteStops,
  type TransportationRow,
} from "@/lib/queries/transportation";
import type {
  NotificationRow,
  TransportationRegistrationWithDetails,
} from "@/lib/queries/transportationRegistrations";
import { cn, formatMMK } from "@/lib/utils";

function initials(name?: string | null) {
  return (name ?? "Student")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

interface DriverHeroProps {
  driverName: string;
  route?: TransportationRow;
}

export function DriverHero({ driverName, route }: DriverHeroProps) {
  const stops = route ? getRouteStops(route) : [];
  const routeLabel = stops.map((stop) => stop.name).join(" -> ");

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-indigo via-brand-indigo-dark to-brand-mint p-4 text-white shadow-md md:p-5">
      <div className="absolute right-6 top-5 hidden h-24 w-56 rounded-full border border-white/20 opacity-60 md:block" />
      <div className="absolute bottom-5 right-12 hidden h-px w-64 bg-white/20 md:block" />
      <div className="relative grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-medium text-white/80">Driver Dashboard</p>
          <h1 className="mt-1 text-xl font-semibold tracking-normal md:text-2xl">
            Welcome back, {driverName}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/80">
            Monitor assigned UIT routes, review student seat requests, and keep today&apos;s commute on schedule.
          </p>
          {route ? (
            <div className="mt-4 rounded-xl bg-white/12 p-3 ring-1 ring-white/20">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <Route className="h-4 w-4" />
                {routeLabel}
              </div>
              <div className="mt-2 grid gap-2 text-sm text-white/80 sm:grid-cols-3">
                <span className="flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  {route.vehicle_type ?? "Vehicle"} {route.vehicle_number ?? ""}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Depart {formatTime(route.departure_time)}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {route.available_seats} seats open
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-white/12 p-3 text-sm text-white/80 ring-1 ring-white/20">
              No assigned route yet.
            </div>
          )}
        </div>
        <Button asChild className="rounded-xl bg-white text-brand-indigo hover:bg-white/90">
          <Link href="/driver/routes">
            <MapPinned className="h-4 w-4" />
            View Today&apos;s Route
          </Link>
        </Button>
      </div>
    </section>
  );
}

interface DashboardMetricCardProps {
  label: string;
  value: number;
  detail: string;
  icon: typeof Bell;
  tone: "green" | "teal" | "blue" | "amber" | "navy";
}

const toneClass = {
  green: "bg-brand-mint/15 text-emerald-700",
  teal: "bg-brand-mint/15 text-brand-mint",
  blue: "bg-brand-indigo/10 text-brand-indigo",
  amber: "bg-amber-50 text-amber-700",
  navy: "bg-secondary text-brand-indigo",
};

export function DashboardMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: DashboardMetricCardProps) {
  return (
    <Card className="min-h-24 rounded-xl border-border bg-card p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 text-xs font-medium leading-4 text-muted-foreground md:text-sm">
          {label}
        </span>
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", toneClass[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <strong className="mt-2 text-2xl font-semibold leading-none text-foreground md:text-3xl">
        {value}
      </strong>
      <p className="mt-1 truncate text-[0.72rem] text-muted-foreground md:text-xs">{detail}</p>
    </Card>
  );
}

export function TodayRouteCard({
  route,
  approvedPassengers,
  pendingRequests,
}: {
  route?: TransportationRow;
  approvedPassengers: number;
  pendingRequests: number;
}) {
  if (!route) {
    return (
      <DriverEmptyState
        title="No assigned routes"
        description="Contact the administrator to receive a route assignment."
        icon={Bus}
      />
    );
  }

  const usedSeats = Math.max(route.total_seats - route.available_seats, 0);
  const capacity =
    route.total_seats > 0 ? Math.min(100, Math.round((usedSeats / route.total_seats) * 100)) : 0;

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Today&apos;s Route</h2>
          <p className="mt-1 text-sm text-muted-foreground">{route.route_name}</p>
        </div>
        <Badge className="bg-brand-mint/15 text-emerald-700">{route.available_seats} seats open</Badge>
      </div>
      <div className="mt-4">
        <RouteTimeline stops={getRouteStops(route)} />
      </div>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <Info icon={Bus} label="Vehicle" value={`${route.vehicle_type ?? "Vehicle"} ${route.vehicle_number ?? ""}`} />
        <Info icon={Users} label="Seats" value={`${usedSeats}/${route.total_seats} filled`} />
        <Info icon={Clock} label="Morning" value={formatTime(route.departure_time)} />
        <Info icon={CalendarClock} label="Evening" value={formatTime(route.return_time)} />
        <Info icon={Wallet} label="Monthly price" value={formatMMK(route.monthly_price)} />
        <Info icon={Bell} label="Pending" value={`${pendingRequests} requests`} />
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
          <span>Seat capacity</span>
          <span>{approvedPassengers} approved</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-indigo to-brand-mint"
            style={{ width: `${capacity}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Bell; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2.5">
      <Icon className="h-4 w-4 text-brand-mint" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function PassengerPreview({ passengers }: { passengers: TransportationRegistrationWithDetails[] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Approved Passengers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Latest confirmed students.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href="/driver/registrations?status=approved">View All Passengers</Link>
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {passengers.length === 0 ? (
          <DriverEmptyState
            title="No approved passengers"
            description="Approved students will appear here after you confirm requests."
            icon={Users}
          />
        ) : (
          passengers.slice(0, 4).map((passenger) => (
            <div key={passenger.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <Avatar>
                {passenger.student?.avatar_url && <AvatarImage src={passenger.student.avatar_url} alt="" />}
                <AvatarFallback className="bg-brand-indigo/10 text-brand-indigo">
                  {initials(passenger.student?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{passenger.student?.full_name ?? "Student"}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {passenger.pickup_stop_name} {passenger.pickup_time ? `- ${passenger.pickup_time}` : ""}
                </p>
              </div>
              <Badge className="bg-brand-mint/15 text-emerald-700">Approved</Badge>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function RecentActivity({ notifications }: { notifications: NotificationRow[] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">Notifications and request updates.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href="/driver/notifications">Open</Link>
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {notifications.length === 0 ? (
          <DriverEmptyState
            title="No recent activity"
            description="New student requests and route updates will appear here."
            icon={Bell}
          />
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div key={notification.id} className="flex gap-3 rounded-xl bg-secondary/60 p-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card text-brand-indigo shadow-sm">
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{notification.title}</p>
                  {!notification.is_read && <span className="h-2 w-2 rounded-full bg-brand-mint" />}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{relativeTime(notification.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function DriverEmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof Bell;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/50 p-5 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-card text-brand-indigo shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
