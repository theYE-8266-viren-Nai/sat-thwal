import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTutorByOwner } from "@/lib/queries/tutors";
import { PageHeader } from "@/components/shared/PageHeader";
import { TutorEditForm } from "@/components/tutor-edit/TutorEditForm";

export default async function TutorEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const tutor = await getTutorByOwner(supabase, user.id);
  if (!tutor) redirect("/tutors/apply");

  return (
    <div className="pb-6">
      <PageHeader title="Edit Tutor Profile" subtitle="Update how students see your listing." />
      <TutorEditForm
        userId={user.id}
        defaultName={tutor.name}
        defaultPhotoUrl={tutor.photo_url ?? ""}
        defaultSubjects={tutor.subjects}
        defaultTownship={tutor.township}
        defaultBio={tutor.bio ?? ""}
        defaultPrice={String(tutor.price_per_session)}
        defaultSessionMode={tutor.session_mode}
        defaultAvailabilityNote={tutor.availability_note ?? ""}
      />
    </div>
  );
}
