"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Eye,
  Filter,
  MapPin,
  Route,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RegistrationStatusActions } from "@/components/driver/RegistrationStatusActions";
import { getRouteStops } from "@/lib/queries/transportation";
import type { TransportationRegistrationWithDetails } from "@/lib/queries/transportationRegistrations";
import type { TransportationRegistrationStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: Array<TransportationRegistrationStatus | "all"> = [
  "all",
  "pending",
  "approved",
  "rejected",
  "cancelled",
];

function initials(name?: string | null) {
  return (name ?? "Student")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusClass(status: TransportationRegistrationStatus) {
  if (status === "approved") return "bg-brand-mint/15 text-emerald-700";
  if (status === "rejected") return "bg-destructive/10 text-destructive";
  if (status === "cancelled") return "bg-slate-100 text-slate-600";
  return "bg-amber-100 text-amber-700";
}

function statusLabel(status: TransportationRegistrationStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function requestDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

interface DriverDashboardRequestsProps {
  registrations: TransportationRegistrationWithDetails[];
}

export function DriverDashboardRequests({ registrations }: DriverDashboardRequestsProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TransportationRegistrationStatus | "all">("pending");
  const [routeId, setRouteId] = useState("all");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("newest");

  const routes = useMemo(() => {
    const routeMap = new Map<string, string>();
    registrations.forEach((registration) => {
      if (registration.route?.id) {
        routeMap.set(registration.route.id, registration.route.route_name);
      }
    });
    return [...routeMap.entries()];
  }, [registrations]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return registrations
      .filter((registration) => {
        const searchable = [
          registration.student?.full_name,
          registration.student?.phone,
          registration.route?.route_name,
          registration.pickup_stop_name,
          registration.pickup_address,
          registration.pickup_time,
          registration.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesQuery = normalized ? searchable.includes(normalized) : true;
        const matchesStatus = status === "all" ? true : registration.status === status;
        const matchesRoute = routeId === "all" ? true : registration.route_id === routeId;
        const matchesDate = date ? registration.created_at.slice(0, 10) === date : true;
        return matchesQuery && matchesStatus && matchesRoute && matchesDate;
      })
      .sort((a, b) => {
        if (sort === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sort === "pickup") {
          return (a.pickup_time ?? "").localeCompare(b.pickup_time ?? "");
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [date, query, registrations, routeId, sort, status]);

  const activeChips = [
    query && `Search: ${query}`,
    status !== "all" && `Status: ${status}`,
    routeId !== "all" && `Route: ${routes.find(([id]) => id === routeId)?.[1] ?? "Selected"}`,
    date && `Date: ${date}`,
  ].filter((chip): chip is string => Boolean(chip));

  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">New Transportation Requests</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review students requesting seats on your assigned routes.
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-700">
          {filtered.filter((item) => item.status === "pending").length} pending
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search students, routes or pickup stops..."
            className="h-10 rounded-xl border-border bg-background pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as TransportationRegistrationStatus | "all")}>
          <SelectTrigger className="h-10 w-full rounded-xl border-border bg-background lg:w-40">
            <Filter className="h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((item) => (
              <SelectItem key={item} value={item}>
                {item === "all" ? "All statuses" : statusLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={routeId} onValueChange={setRouteId}>
          <SelectTrigger className="h-10 w-full rounded-xl border-border bg-background lg:w-52">
            <Route className="h-4 w-4" />
            <SelectValue placeholder="Route" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All routes</SelectItem>
            {routes.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-10 rounded-xl border-border bg-background"
            aria-label="Filter by request date"
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-10 w-full rounded-xl border-border bg-background lg:w-36">
              <SlidersHorizontal className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="pickup">Pickup time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span key={chip} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-brand-indigo">
              {chip}
            </span>
          ))}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setQuery("");
              setStatus("pending");
              setRouteId("all");
              setDate("");
            }}
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/50 p-5 text-center">
            <ClipboardListIcon />
            <p className="mt-3 text-sm font-semibold text-foreground">No pending requests</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You have reviewed all current transportation requests.
            </p>
          </div>
        ) : (
          filtered.slice(0, 6).map((registration) => (
            <TransportationRequestCard key={registration.id} registration={registration} />
          ))
        )}
      </div>

      {filtered.length > 6 && (
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/driver/registrations">View all requests</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

function TransportationRequestCard({ registration }: { registration: TransportationRegistrationWithDetails }) {
  const stops = registration.route ? getRouteStops(registration.route) : [];
  const studentName = registration.student?.full_name ?? "Student";

  return (
    <article className="rounded-xl border border-border bg-card p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <Avatar size="lg">
            {registration.student?.avatar_url && <AvatarImage src={registration.student.avatar_url} alt="" />}
            <AvatarFallback className="bg-brand-indigo/10 font-semibold text-brand-indigo">
              {initials(studentName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">{studentName}</h3>
              <Badge className={cn("rounded-full", statusClass(registration.status))}>
                {statusLabel(registration.status)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {registration.student?.phone ?? "UIT student"} · {registration.route?.route_name ?? "Transportation route"}
            </p>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-mint" />
                {registration.pickup_stop_name}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-mint" />
                {registration.pickup_time ?? "Pickup time pending"}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-brand-mint" />
                {requestDate(registration.created_at)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl sm:flex-none">
            <Link href={`/driver/registrations?registration=${registration.id}`}>
              <Eye className="h-4 w-4" />
              View Details
            </Link>
          </Button>
          <RegistrationStatusActions
            registrationId={registration.id}
            status={registration.status}
            studentName={studentName}
            routeName={registration.route?.route_name}
            pickupStopName={registration.pickup_stop_name}
            pickupTime={registration.pickup_time}
            remainingSeats={registration.route?.available_seats}
          />
        </div>
      </div>

      {stops.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-secondary/60 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <Route className="h-3.5 w-3.5 text-brand-indigo" />
            Route preview · {relativeTime(registration.created_at)}
          </div>
          <div className="mt-3 grid gap-2 sm:flex sm:items-center">
            {stops.map((stop, index) => (
              <div key={stop.id} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-mint ring-4 ring-brand-mint/10" />
                <span className={cn("font-medium", stop.name === registration.pickup_stop_name ? "text-brand-indigo" : "text-foreground")}>
                  {stop.name}
                </span>
                {stop.pickupTime && <span className="text-xs text-muted-foreground">{stop.pickupTime}</span>}
                {index < stops.length - 1 && <span className="hidden h-px w-8 bg-border sm:block" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function ClipboardListIcon() {
  return (
    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-card text-brand-indigo shadow-sm">
      <UserRound className="h-5 w-5" />
    </span>
  );
}
