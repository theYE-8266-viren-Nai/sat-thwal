"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getRequests } from "@/lib/queries/requests";
import { profileToStudentProfile } from "@/lib/queries/profiles";
import { getCurrentProfile } from "@/lib/serviceFlowData";
import { queryKeys } from "@/lib/queryKeys";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PreferenceEditor } from "@/components/profile/PreferenceEditor";
import { NotificationLanguageSettings } from "@/components/profile/NotificationLanguageSettings";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: queryKeys.currentProfile,
    queryFn: () => getCurrentProfile(createClient()),
  });
  const profileRow = profileQuery.data ?? null;
  const profileId = profileRow?.id ?? null;
  const requestsQuery = useQuery({
    queryKey: profileId ? queryKeys.profileRequests(profileId) : ["requests", "profile", "anonymous"],
    queryFn: () => getRequests(createClient(), profileId as string),
    enabled: Boolean(profileId),
  });

  if (!profileRow) return <ProfilePageSkeleton />;

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
          <span className="flex min-w-11 items-center justify-end gap-1 text-sm font-medium text-foreground">
            {requestsQuery.data ? requestsQuery.data.length : <Skeleton className="h-4 w-5" />}
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

function ProfilePageSkeleton() {
  return (
    <div className="pb-6">
      <PageHeader title="Profile" />
      <div className="flex items-center gap-4 px-5 pt-6 md:px-8">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <section key={index} className="mt-6 px-5 md:px-8">
          <Skeleton className="mb-2 h-4 w-28" />
          <Skeleton className="h-24 rounded-2xl" />
        </section>
      ))}
    </div>
  );
}
