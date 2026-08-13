"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createRequest } from "@/lib/queries/requests";
import { createTransportationRegistration } from "@/lib/queries/transportationRegistrations";
import { queryKeys } from "@/lib/queryKeys";
import { createOptimisticRequest, type RequestRow, type SavedRequestItem } from "@/lib/serviceFlowData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { RouteStop, ServiceCardData } from "@/types/domain";
import type { RequestStatus } from "@/types/database.types";

type ConfirmationAction = "book" | "request" | "requestSeat" | "subscribe" | "contact";

interface ConfirmationModalProps {
  action: ConfirmationAction;
  category: ServiceCategory;
  serviceId: string;
  profileId: string;
  title: string;
  contactInfo?: string;
  routeStops?: RouteStop[];
  optimisticCard?: ServiceCardData;
  onOptimisticStatusChange?: (status: RequestStatus | null) => void;
  trigger: React.ReactNode;
}

const ACTION_COPY: Record<ConfirmationAction, { title: string; description: string; confirmLabel: string }> = {
  book: {
    title: "Send support request",
    description: "Send a request for this school-approved service. The service contact will confirm availability.",
    confirmLabel: "Send request",
  },
  request: {
    title: "Send support request",
    description: "Send a request through Set Thwal. The service contact will confirm the details.",
    confirmLabel: "Send request",
  },
  requestSeat: {
    title: "Request a seat",
    description: "Add your detailed pickup address. The approved ferry contact will confirm your pending seat request.",
    confirmLabel: "Request seat",
  },
  subscribe: {
    title: "Request meal plan",
    description: "Send a monthly meal plan request. The approved meal contact will confirm capacity.",
    confirmLabel: "Request plan",
  },
  contact: {
    title: "Contact service",
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
  optimisticCard,
  onOptimisticStatusChange,
  trigger,
}: ConfirmationModalProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupStopId, setPickupStopId] = useState("");
  const [done, setDone] = useState(false);
  const copy = ACTION_COPY[action];

  const requestMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      if (action === "requestSeat" && category === "transportation") {
        const pickupStop = routeStops.find((stop) => stop.id === pickupStopId) ?? routeStops[0];
        return createTransportationRegistration(
          supabase,
          profileId,
          serviceId,
          pickupStop?.id ?? "pickup-stop",
          pickupStop?.name ?? "Pickup stop",
          pickupStop?.pickupTime,
          note.trim(),
          phone.trim(),
        );
      }

      return createRequest(supabase, profileId, category, serviceId, note.trim() || undefined);
    },
    onMutate: async () => {
      setDone(true);
      onOptimisticStatusChange?.("pending");

      const savedKey = queryKeys.savedRequests(profileId);
      await queryClient.cancelQueries({ queryKey: savedKey });
      const previousSaved = queryClient.getQueryData<SavedRequestItem[]>(savedKey);
      const optimisticRequest: RequestRow = {
        ...createOptimisticRequest({
          profileId,
          category,
          serviceId,
          note: note.trim() || undefined,
        }),
        pickup_stop_id: pickupStopId || null,
        pickup_stop_name:
          routeStops.find((stop) => stop.id === pickupStopId)?.name ?? null,
        pickup_address: action === "requestSeat" ? note.trim() : null,
        pickup_time: routeStops.find((stop) => stop.id === pickupStopId)?.pickupTime ?? null,
      };

      if (optimisticCard) {
        queryClient.setQueryData<SavedRequestItem[]>(savedKey, (current = []) => [
          { request: optimisticRequest, card: optimisticCard },
          ...current.filter((item) => item.request.id !== optimisticRequest.id),
        ]);
      }

      return { optimisticRequest, previousSaved };
    },
    onError: (error, _variables, context) => {
      if (context?.previousSaved) {
        queryClient.setQueryData(queryKeys.savedRequests(profileId), context.previousSaved);
      } else if (context?.optimisticRequest) {
        queryClient.setQueryData<SavedRequestItem[]>(queryKeys.savedRequests(profileId), (current = []) =>
          current.filter((item) => item.request.id !== context.optimisticRequest.id),
        );
      }
      onOptimisticStatusChange?.(null);
      setDone(false);
      const message = error instanceof Error ? error.message : "Couldn't send your request. Try again.";
      toast.error(message);
    },
    onSuccess: (request, _variables, context) => {
      if (optimisticCard) {
        queryClient.setQueryData<SavedRequestItem[]>(queryKeys.savedRequests(profileId), (current = []) =>
          current.map((item) =>
            item.request.id === context?.optimisticRequest.id ? { ...item, request } : item,
          ),
        );
      }
      onOptimisticStatusChange?.(request.status);
      toast.success("Request pending", { description: "Track it from Saved." });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedRequests(profileId) });
    },
  });

  function handleConfirm() {
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

    if (action === "requestSeat" && !phone.trim()) {
      toast.error("Please add your phone number.");
      return;
    }

    requestMutation.mutate();
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setNote("");
      setPhone("");
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
              Your request for {title} is pending. You can track its status from Saved.
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
                  {action === "requestSeat" && (
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number for the ferry contact"
                      className="h-10"
                    />
                  )}
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      action === "requestSeat"
                        ? "Enter your detailed pickup address"
                        : "Add a note for the service contact (optional)"
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
                disabled={requestMutation.isPending}
                aria-busy={requestMutation.isPending}
                className="w-full rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
              >
                {copy.confirmLabel}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
