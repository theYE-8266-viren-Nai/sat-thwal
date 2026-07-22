"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/queries/profiles";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { ACADEMIC_YEARS } from "@/lib/constants/subjects";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { BudgetRangeSlider } from "@/components/onboarding/BudgetRangeSlider";
import { SubjectMultiSelect } from "@/components/onboarding/SubjectMultiSelect";
import { ProfileSection, InfoRow } from "@/components/profile/ProfileSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMMK } from "@/lib/utils";
import type { StudentProfile } from "@/types/domain";

export function PreferenceEditor({ profile }: { profile: StudentProfile }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [academicYear, setAcademicYear] = useState(profile.academicYear ?? "");
  const [township, setTownship] = useState(profile.township ?? "");
  const [budget, setBudget] = useState<[number, number]>([
    profile.budgetMin ?? 50000,
    profile.budgetMax ?? 150000,
  ]);
  const [subjects, setSubjects] = useState<string[]>(profile.preferredSubjects);

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      await updateProfile(supabase, profile.id, {
        academic_year: academicYear,
        township,
        budget_min: budget[0],
        budget_max: budget[1],
        preferred_subjects: subjects,
      });
      setEditing(false);
      router.refresh();
      toast.success("Profile updated");
    } catch {
      toast.error("Couldn't update your profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setAcademicYear(profile.academicYear ?? "");
    setTownship(profile.township ?? "");
    setBudget([profile.budgetMin ?? 50000, profile.budgetMax ?? 150000]);
    setSubjects(profile.preferredSubjects);
    setEditing(false);
  }

  if (!editing) {
    return (
      <>
        <ProfileSection title="Academic details">
          <InfoRow label="Academic year" value={profile.academicYear ?? "Not set"} />
          <InfoRow label="Township" value={profile.township ?? "Not set"} />
        </ProfileSection>

        <ProfileSection title="Preferences">
          <InfoRow
            label="Monthly budget"
            value={
              profile.budgetMin != null && profile.budgetMax != null
                ? `${formatMMK(profile.budgetMin)} - ${formatMMK(profile.budgetMax)}`
                : "Not set"
            }
          />
          <div className="py-3">
            <span className="text-sm text-muted-foreground">Preferred subjects</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.preferredSubjects.length > 0 ? (
                profile.preferredSubjects.map((subject) => (
                  <Badge key={subject} variant="outline" className="rounded-full">
                    {subject}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Not set</span>
              )}
            </div>
          </div>
        </ProfileSection>

        <div className="mt-4 px-5 md:px-8">
          <Button variant="outline" className="w-full gap-2" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Edit preferences
          </Button>
        </div>
      </>
    );
  }

  return (
    <section className="mt-6 flex flex-col gap-5 px-5 md:px-8">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <LabeledSelect
          id="profile-academic-year"
          label="Current academic year"
          placeholder="Select your academic year"
          value={academicYear}
          onChange={setAcademicYear}
          options={ACADEMIC_YEARS}
        />
        <LabeledSelect
          id="profile-township"
          label="Township / location"
          placeholder="Select your township"
          value={township}
          onChange={setTownship}
          options={TOWNSHIPS}
        />
        <BudgetRangeSlider value={budget} onChange={setBudget} />
        <SubjectMultiSelect value={subjects} onChange={setSubjects} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={saving}>
          Cancel
        </Button>
        <Button className="flex-1 bg-brand-indigo hover:bg-brand-indigo-dark" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </section>
  );
}
