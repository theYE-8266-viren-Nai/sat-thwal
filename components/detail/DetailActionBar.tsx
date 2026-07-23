"use client";

import Link from "next/link";
import { Pencil, Inbox, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/detail/ConfirmationModal";
import { CATEGORIES } from "@/lib/constants/categories";
import { REQUEST_STATUS_LABEL } from "@/lib/constants/requestStatus";
import type { RequestStatus } from "@/types/database.types";
import type { RouteStop, ServiceCategory } from "@/types/domain";

const PRIMARY_ACTION: Record<ServiceCategory, "book" | "request" | "requestSeat" | "subscribe"> = {
  tutor: "request",
  hostel: "request",
  food: "subscribe",
  transportation: "requestSeat",
};

const OWNER_EDIT_HREF: Partial<Record<ServiceCategory, string>> = {
  tutor: "/tutors/edit",
  hostel: "/hostels/edit",
};

const OWNER_REQUESTS_HREF: Partial<Record<ServiceCategory, string>> = {
  tutor: "/tutors/requests",
  hostel: "/hostels/requests",
};

interface DetailActionBarProps {
  category: ServiceCategory;
  serviceId: string;
  profileId: string;
  title: string;
  contactInfo: string;
  initialSaved: boolean;
  isOwner?: boolean;
  routeStops?: RouteStop[];
  existingRequestStatus?: RequestStatus | null;
  requestBlockReason?: string | null;
}

export function DetailActionBar({
  category,
  serviceId,
  profileId,
  title,
  isOwner = false,
  routeStops,
  existingRequestStatus = null,
  requestBlockReason = null,
}: DetailActionBarProps) {
  const categoryConfig = CATEGORIES[category];
  const requestAlreadyExists =
    (category === "tutor" || category === "hostel" || category === "transportation") &&
    existingRequestStatus !== null;
  const requestBlocked = requestBlockReason !== null;

  if (isOwner) {
    return (
      <div className="sticky bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom))] z-30 flex items-center gap-2 border-t border-border bg-card px-4 pt-3 pb-[calc(0.75rem+var(--safe-bottom))] sm:px-5 md:bottom-0 md:px-8">
        {OWNER_REQUESTS_HREF[category] && (
          <Button asChild variant="outline" size="touch" className="shrink-0 rounded-full px-3 sm:px-4">
            <Link href={OWNER_REQUESTS_HREF[category]}>
              <Inbox className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
            </Link>
          </Button>
        )}
        <Button
          asChild
          size="touch"
          className="min-w-0 flex-1 rounded-full text-white"
          style={{ backgroundColor: categoryConfig.color }}
        >
          <Link href={OWNER_EDIT_HREF[category] ?? "#"}>
            <Pencil className="h-4 w-4" />
            <span className="truncate">Edit Listing</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom))] z-30 flex items-center gap-2 border-t border-border bg-card px-4 pt-3 pb-[calc(0.75rem+var(--safe-bottom))] sm:px-5 md:bottom-0 md:px-8">
      {requestAlreadyExists || requestBlocked ? (
        <Button
          size="touch"
          className="min-w-0 flex-1 rounded-full"
          variant="secondary"
          disabled
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="truncate">
            {requestBlockReason ??
              (existingRequestStatus ? REQUEST_STATUS_LABEL[existingRequestStatus] : "Requested")}
          </span>
        </Button>
      ) : (
        <ConfirmationModal
          action={PRIMARY_ACTION[category]}
          category={category}
          serviceId={serviceId}
          profileId={profileId}
          title={title}
          routeStops={routeStops}
          trigger={
            <Button
              size="touch"
              className="min-w-0 flex-1 rounded-full text-white"
              style={{ backgroundColor: categoryConfig.color }}
            >
              <span className="truncate">{categoryConfig.bookCtaLabel}</span>
            </Button>
          }
        />
      )}
    </div>
  );
}
