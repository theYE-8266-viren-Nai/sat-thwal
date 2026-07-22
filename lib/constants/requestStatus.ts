import type { RequestStatus } from "@/types/database.types";

export const REQUEST_STATUS_STYLES: Record<RequestStatus, string> = {
  pending: "bg-brand-orange/15 text-orange-700",
  confirmed: "bg-brand-mint/15 text-emerald-700",
  completed: "bg-secondary text-secondary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  confirmed: "Accepted",
  completed: "Completed",
  cancelled: "Cancelled",
};
