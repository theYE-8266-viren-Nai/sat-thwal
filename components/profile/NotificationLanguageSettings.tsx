"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/queries/profiles";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "my", label: "Myanmar (မြန်မာဘာသာ)" },
];

interface NotificationLanguageSettingsProps {
  profileId: string;
  notificationOptIn: boolean;
  languagePreference: string;
}

export function NotificationLanguageSettings({
  profileId,
  notificationOptIn,
  languagePreference,
}: NotificationLanguageSettingsProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(notificationOptIn);
  const [language, setLanguage] = useState(languagePreference);

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

  async function handleLanguageChange(value: string) {
    setLanguage(value);
    const supabase = createClient();
    try {
      await updateProfile(supabase, profileId, { language_preference: value });
      router.refresh();
    } catch {
      toast.error("Couldn't update language preference.");
    }
  }

  return (
    <ProfileSection title="Settings">
      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-muted-foreground">Notifications</span>
        <Switch checked={notifications} onCheckedChange={handleNotificationsChange} />
      </div>
      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-muted-foreground">Language</span>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ProfileSection>
  );
}
