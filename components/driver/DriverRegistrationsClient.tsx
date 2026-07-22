"use client";

import { useMemo, useState } from "react";
import { MapPin, Phone, Search, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrationStatusActions } from "@/components/driver/RegistrationStatusActions";
import type {
  TransportationRegistrationWithDetails,
} from "@/lib/queries/transportationRegistrations";
import type { RequestStatus } from "@/types/database.types";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLES } from "@/lib/constants/requestStatus";

const STATUS_TABS: Array<RequestStatus | "all"> = [
  "pending",
  "confirmed",
  "cancelled",
  "all",
];

interface DriverRegistrationsClientProps {
  registrations: TransportationRegistrationWithDetails[];
}

export function DriverRegistrationsClient({ registrations }: DriverRegistrationsClientProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return registrations;

    return registrations.filter((registration) => {
      const searchable = [
        registration.student?.full_name,
        registration.student?.phone,
        registration.route?.route_name,
        registration.route?.vehicle_type,
        registration.pickup_stop_name,
        registration.pickup_address,
        registration.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalized);
    });
  }, [query, registrations]);

  function registrationsFor(tab: RequestStatus | "all") {
    if (tab === "all") return filtered;
    return filtered.filter((registration) => registration.status === tab);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search students, routes or pickup stops..."
          className="h-11 rounded-xl pl-9"
        />
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="px-3 capitalize">
              {tab}
              <span className="ml-1 text-xs text-muted-foreground">
                {registrationsFor(tab).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
            {registrationsFor(tab).length === 0 ? (
              <Card className="border-dashed p-8 text-center">
                <p className="text-sm font-medium text-foreground">No {tab} requests</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Matching seat requests will appear here.
                </p>
              </Card>
            ) : (
              registrationsFor(tab).map((registration) => (
                <Card key={registration.id} className="gap-4 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {registration.student?.full_name ?? "Student"}
                        </h3>
                        <Badge className={REQUEST_STATUS_STYLES[registration.status]}>
                          {REQUEST_STATUS_LABEL[registration.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {registration.route?.route_name ?? "Transportation route"}
                      </p>
                    </div>
                    <RegistrationStatusActions
                      registrationId={registration.id}
                      status={registration.status}
                      studentName={registration.student?.full_name}
                      routeName={registration.route?.route_name}
                      pickupStopName={registration.pickup_stop_name}
                      pickupTime={registration.pickup_time}
                      remainingSeats={registration.route?.available_seats}
                    />
                  </div>

                  <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                    <span className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-brand-mint" />
                      <span>
                        <span className="block font-medium text-foreground">
                          {registration.pickup_stop_name}
                          {registration.pickup_time ? `, ${registration.pickup_time}` : ""}
                        </span>
                        {registration.pickup_address}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-brand-mint" />
                      {registration.student?.phone ?? "No phone added"}
                    </span>
                    <span className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-brand-mint" />
                      Requested {new Date(registration.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {registration.rejection_reason && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      Rejection reason: {registration.rejection_reason}
                    </p>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
