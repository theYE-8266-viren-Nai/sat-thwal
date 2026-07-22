"use client";

import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full"
      onClick={() => toast("You're all caught up!", { description: "No new notifications." })}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-orange" />
    </Button>
  );
}
