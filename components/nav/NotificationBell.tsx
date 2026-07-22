"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUnseenResponses, markResponsesSeen } from "@/lib/queries/requests";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CATEGORIES } from "@/lib/constants/categories";
import type { Database } from "@/types/database.types";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

interface NotificationBellProps {
  profileId: string;
}

export function NotificationBell({ profileId }: NotificationBellProps) {
  const [unseen, setUnseen] = useState<RequestRow[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const rows = await getUnseenResponses(supabase, profileId);
      if (!cancelled) setUnseen(rows);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && unseen.length > 0) {
      const supabase = createClient();
      await markResponsesSeen(supabase);
      setUnseen([]);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="ghost"
        size="icon-touch"
        className="relative rounded-full"
        onClick={() => setOpen(true)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unseen.length > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-orange" />
        )}
      </Button>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-[calc(1rem+var(--safe-bottom))]"
      >
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Updates on the requests you&apos;ve sent.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 px-4">
          {unseen.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up!</p>
          ) : (
            unseen.map((request) => {
              const category = CATEGORIES[request.service_type];
              const accepted = request.status === "confirmed";
              return (
                <div key={request.id} className="flex items-start gap-3 rounded-xl bg-secondary px-4 py-3">
                  {accepted ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <p className="text-sm text-secondary-foreground">
                    Your {category.singularLabel.toLowerCase()} request was {accepted ? "accepted" : "declined"}.
                  </p>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
