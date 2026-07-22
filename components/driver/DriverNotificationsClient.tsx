"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRow,
} from "@/lib/queries/transportationRegistrations";
import { cn } from "@/lib/utils";

interface DriverNotificationsClientProps {
  driverId: string;
  notifications: NotificationRow[];
}

export function DriverNotificationsClient({
  driverId,
  notifications,
}: DriverNotificationsClientProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

  async function markRead(notificationId: string) {
    try {
      setPendingId(notificationId);
      const supabase = createClient();
      await markNotificationRead(supabase, notificationId);
      router.refresh();
    } catch {
      toast.error("Could not mark notification as read.");
    } finally {
      setPendingId(null);
    }
  }

  async function markAllRead() {
    try {
      setPendingId("all");
      const supabase = createClient();
      await markAllNotificationsRead(supabase, driverId);
      router.refresh();
    } catch {
      toast.error("Could not mark notifications as read.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {notifications.filter((item) => !item.is_read).length} unread updates
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={pendingId === "all" || notifications.every((item) => item.is_read)}
          onClick={markAllRead}
          aria-label="Mark all notifications as read"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New seat requests and student updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className={cn(
                "rounded-lg border border-border bg-card p-4",
                !notification.is_read && "border-brand-mint/50 bg-brand-mint/5",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/driver/registrations?registration=${notification.registration_id ?? ""}`}
                      className="font-semibold text-foreground hover:text-brand-indigo"
                    >
                      {notification.title}
                    </Link>
                    {!notification.is_read && <Badge className="bg-brand-mint text-white">New</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pendingId === notification.id}
                    onClick={() => markRead(notification.id)}
                    aria-label={`Mark ${notification.title} as read`}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
