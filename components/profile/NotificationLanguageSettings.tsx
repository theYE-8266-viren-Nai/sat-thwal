"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/queries/profiles";
import { queryKeys } from "@/lib/queryKeys";
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
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(notificationOptIn);

  async function handleNotificationsChange(checked: boolean) {
    setNotifications(checked);
    const supabase = createClient();
    try {
      const updatedProfile = await updateProfile(supabase, profileId, { notification_opt_in: checked });
      queryClient.setQueryData(queryKeys.currentProfile, updatedProfile);
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
