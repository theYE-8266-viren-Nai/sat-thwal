"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/queries/profiles";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Switch } from "@/components/ui/switch";

interface NotificationLanguageSettingsProps {
  profileId: string;
  notificationOptIn: boolean;
}

export function NotificationLanguageSettings({
  profileId,
  notificationOptIn,
}: NotificationLanguageSettingsProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(notificationOptIn);

  async function handleNotificationsChange(checked: boolean) {
    setNotifications(checked);
    const supabase = createClient();
    try {
      await updateProfile(supabase, profileId, { notification_opt_in: checked });
      router.refresh();
    } catch {
      setNotifications(!checked);
      toast.error("Couldn't update notification preferences.");
    }
  }

  return (
    <ProfileSection title="Settings">
      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-muted-foreground">Notifications</span>
        <Switch checked={notifications} onCheckedChange={handleNotificationsChange} />
      </div>
    </ProfileSection>
  );
}
