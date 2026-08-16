import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth/server";
import { getTutorByOwner } from "@/lib/queries/tutors";
import { PageHeader } from "@/components/shared/PageHeader";
import { TutorApplyForm } from "@/components/tutor-apply/TutorApplyForm";

export default async function TutorApplyPage() {
  const { supabase, userId, profile } = await getServerAuthContext();
  if (!userId) return null;

  const existing = await getTutorByOwner(supabase, userId);
  if (existing) redirect(`/services/tutor/${existing.id}`);

  return (
    <div className="pb-6">
      <PageHeader title="Become a Tutor" subtitle="Upload your grades to check eligibility." />
      <TutorApplyForm
        userId={userId}
        defaultName={profile?.full_name ?? ""}
        defaultTownship={profile?.township ?? ""}
      />
    </div>
  );
}
