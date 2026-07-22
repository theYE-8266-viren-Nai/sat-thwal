import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profiles";
import { getTutorByOwner } from "@/lib/queries/tutors";
import { PageHeader } from "@/components/shared/PageHeader";
import { TutorApplyForm } from "@/components/tutor-apply/TutorApplyForm";

export default async function TutorApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const existing = await getTutorByOwner(supabase, user.id);
  if (existing) redirect(`/services/tutor/${existing.id}`);

  const profile = await getProfile(supabase, user.id);

  return (
    <div className="pb-6">
      <PageHeader title="Become a Tutor" subtitle="Upload your grades to check eligibility." />
      <TutorApplyForm
        defaultName={profile?.full_name ?? ""}
        defaultUniversity={profile?.university ?? ""}
        defaultTownship={profile?.township ?? ""}
      />
    </div>
  );
}
