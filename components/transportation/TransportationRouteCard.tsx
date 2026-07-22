"use client";

import Link from "next/link";
import { ArrowRight, Bus, Clock, Users, Wallet } from "lucide-react";
import { ConfirmationModal } from "@/components/detail/ConfirmationModal";
import { SaveButton } from "@/components/services/SaveButton";
import { RouteTimeline } from "@/components/transportation/RouteTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ServiceCardData } from "@/types/domain";

interface TransportationRouteCardProps {
  data: ServiceCardData;
  profileId: string;
  initialSaved: boolean;
}

export function TransportationRouteCard({
  data,
  profileId,
  initialSaved,
}: TransportationRouteCardProps) {
  return (
    <Card className="flex h-full flex-col gap-4 border-border p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{data.title}</h3>
            {data.vehicleType && (
              <Badge variant="secondary" className="h-auto px-2 py-1 text-xs">
                {data.vehicleType}
              </Badge>
            )}
          </div>
          {data.driverName && (
            <p className="mt-1 text-xs text-muted-foreground">Driver: {data.driverName}</p>
          )}
        </div>
        <SaveButton
          profileId={profileId}
          category={data.category}
          serviceId={data.id}
          initialSaved={initialSaved}
          className="h-9 w-9 shrink-0 border border-border shadow-none"
        />
      </div>

      <RouteTimeline stops={data.routeStops ?? []} compact />

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Bus className="h-3.5 w-3.5 text-category-transport" />
          {data.vehicleType ?? "Shared vehicle"}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-category-transport" />
          {data.availableSeats} / {data.totalSeats} seats
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-category-transport" />
          {data.departureTimeLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-category-transport" />
          {data.priceLabel}
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" size="touch" className="flex-1 rounded-xl">
          <Link href={data.href} aria-label={`View route ${data.title}`}>
            View Route
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <ConfirmationModal
          action="requestSeat"
          category={data.category}
          serviceId={data.id}
          profileId={profileId}
          title={data.title}
          trigger={
            <Button
              size="touch"
              className="flex-1 rounded-xl bg-category-transport text-white hover:bg-emerald-600"
              aria-label={`Book seat for ${data.title}`}
            >
              Book Seat
            </Button>
          }
        />
      </div>
    </Card>
  );
}
