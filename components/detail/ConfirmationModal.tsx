"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createRequest } from "@/lib/queries/requests";
import { createTransportationRegistration } from "@/lib/queries/transportationRegistrations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ServiceCategory } from "@/types/domain";
import type { RouteStop } from "@/types/domain";

type ConfirmationAction = "book" | "request" | "requestSeat" | "contact";

interface ConfirmationModalProps {
  action: ConfirmationAction;
  category: ServiceCategory;
  serviceId: string;
  profileId: string;
  title: string;
  contactInfo?: string;
  routeStops?: RouteStop[];
  trigger: React.ReactNode;
}

const ACTION_COPY: Record<ConfirmationAction, { title: string; description: string; confirmLabel: string }> = {
  book: {
    title: "Confirm booking",
    description: "Send a booking request. The provider will confirm availability with you directly.",
    confirmLabel: "Confirm booking",
  },
  request: {
    title: "Confirm request",
    description: "Send a request. The provider will follow up to confirm the details.",
    confirmLabel: "Confirm request",
  },
  requestSeat: {
    title: "Request a seat",
    description: "Add your detailed pickup address. The driver will confirm your pending seat request.",
    confirmLabel: "Book seat",
  },
  contact: {
    title: "Contact provider",
    description: "",
    confirmLabel: "Got it",
  },
};

export function ConfirmationModal({
  action,
  category,
  serviceId,
  profileId,
  title,
  contactInfo,
  routeStops = [],
  trigger,
}: ConfirmationModalProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pickupStopId, setPickupStopId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const copy = ACTION_COPY[action];

  async function handleConfirm() {
    if (action === "contact") {
      setOpen(false);
      return;
    }

    if (action === "requestSeat" && routeStops.length > 0 && !pickupStopId) {
      toast.error("Please choose your pickup stop.");
      return;
    }

    if (action === "requestSeat" && !note.trim()) {
      toast.error("Please add your detailed pickup address.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      if (action === "requestSeat" && category === "transportation") {
        const pickupStop =
          routeStops.find((stop) => stop.id === pickupStopId) ?? routeStops[0];
        await createTransportationRegistration(
          supabase,
          profileId,
          serviceId,
          pickupStop?.id ?? "pickup-stop",
          pickupStop?.name ?? "Pickup stop",
          pickupStop?.pickupTime,
          note.trim(),
        );
      } else {
        await createRequest(supabase, profileId, category, serviceId, note.trim() || undefined);
      }
      setDone(true);
      toast.success("Request pending", { description: `Track it from Saved & Bookings.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn't send your request. Try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setNote("");
      setPickupStopId("");
      setDone(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-[calc(1rem+var(--safe-bottom))]"
      >
        {done ? (
          <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-brand-mint" />
            <SheetTitle>Request sent</SheetTitle>
            <p className="text-sm text-muted-foreground">
              Your request for {title} is pending. You can track its status from Saved & Bookings.
            </p>
            <Button
              size="touch"
              className="mt-2 w-full rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{copy.title}</SheetTitle>
              <SheetDescription>
                {action === "contact" ? `Contact details for ${title}.` : `${copy.description} (${title})`}
              </SheetDescription>
            </SheetHeader>

            <div className="px-4">
              {action === "contact" ? (
                <p className="rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                  {contactInfo}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {action === "requestSeat" && routeStops.length > 0 && (
                    <Select value={pickupStopId} onValueChange={setPickupStopId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose pickup stop" />
                      </SelectTrigger>
                      <SelectContent>
                        {routeStops.map((stop) => (
                          <SelectItem key={stop.id} value={stop.id}>
                            {stop.name}
                            {stop.pickupTime ? ` - ${stop.pickupTime}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      action === "requestSeat"
                        ? "Enter your detailed pickup address"
                        : "Add a note for the provider (optional)"
                    }
                    rows={action === "requestSeat" ? 4 : 3}
                  />
                </div>
              )}
            </div>

            <SheetFooter>
              <Button
                size="touch"
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
              >
                {submitting ? "Sending..." : copy.confirmLabel}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
