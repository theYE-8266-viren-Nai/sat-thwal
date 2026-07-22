"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getRoleLandingPath } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/queries/profiles";
import { TOWNSHIPS } from "@/lib/constants/townships";
import { ACADEMIC_YEARS } from "@/lib/constants/subjects";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { BudgetRangeSlider } from "@/components/onboarding/BudgetRangeSlider";
import { SubjectMultiSelect } from "@/components/onboarding/SubjectMultiSelect";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const [academicYear, setAcademicYear] = useState("");
  const [township, setTownship] = useState("");
  const [budget, setBudget] = useState<[number, number]>([50000, 150000]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = academicYear && township;

  async function handleContinue() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Your session expired — please log in again.");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "driver" || profile?.role === "admin" || profile?.role === "restaurant") {
        router.push(getRoleLandingPath(profile.role));
        router.refresh();
        return;
      }

      await updateProfile(supabase, user.id, {
        academic_year: academicYear,
        township,
        budget_min: budget[0],
        budget_max: budget[1],
        preferred_subjects: subjects,
        onboarding_completed: true,
      });

      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-8 px-5 py-10">
      <Logo />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          Everything students need, in one place.
        </h1>
        <p className="text-muted-foreground">
          Tell us a bit about you so we can personalize tutors, hostels, food, and
          transportation recommendations. You can always change this later from your profile.
        </p>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <LabeledSelect
          id="academicYear"
          label="Current academic year"
          placeholder="Select your academic year"
          value={academicYear}
          onChange={setAcademicYear}
          options={ACADEMIC_YEARS}
        />
        <LabeledSelect
          id="township"
          label="Township / location"
          placeholder="Select your township"
          value={township}
          onChange={setTownship}
          options={TOWNSHIPS}
        />
        <BudgetRangeSlider value={budget} onChange={setBudget} />
        <SubjectMultiSelect value={subjects} onChange={setSubjects} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        size="touch"
        disabled={!canContinue || loading}
        onClick={handleContinue}
        className="rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
      >
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
