import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile, profileToStudentProfile } from "@/lib/queries/profiles";
import { getRequests } from "@/lib/queries/requests";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PreferenceEditor } from "@/components/profile/PreferenceEditor";
import { NotificationLanguageSettings } from "@/components/profile/NotificationLanguageSettings";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { LogoutButton } from "@/components/profile/LogoutButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRow, requests] = await Promise.all([
    getProfile(supabase, user.id),
    getRequests(supabase, user.id),
  ]);

  if (!profileRow) return null;
  const profile = profileToStudentProfile(profileRow);

  return (
    <div className="pb-6">
      <PageHeader title="Profile" />
      <ProfileHeader
        name={profile.fullName ?? "Student"}
        academicYear={profile.academicYear}
        avatarUrl={profile.avatarUrl}
      />

      <PreferenceEditor profile={profile} />

      <ProfileSection title="Activity">
        <Link href="/saved" className="flex min-h-11 items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">Request history</span>
          <span className="flex items-center gap-1 text-sm font-medium text-foreground">
            {requests.length}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </span>
        </Link>
      </ProfileSection>

      <NotificationLanguageSettings
        profileId={profile.id}
        notificationOptIn={profile.notificationOptIn}
      />

      <div className="mt-6 px-5 md:px-8">
        <LogoutButton />
      </div>
    </div>
  );
}
