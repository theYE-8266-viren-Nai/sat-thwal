"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LabeledSelect } from "@/components/shared/LabeledSelect";
import { SubjectMultiSelect } from "@/components/onboarding/SubjectMultiSelect";
import { GradesCsvUpload } from "@/components/tutor-apply/GradesCsvUpload";
import { UNIVERSITIES } from "@/lib/constants/universities";
import { TOWNSHIPS } from "@/lib/constants/townships";
import type { EligibilityResult } from "@/lib/tutorEligibility";
import { applyAsTutor } from "@/lib/actions/tutors";

interface TutorApplyFormProps {
  defaultName: string;
  defaultUniversity: string;
  defaultTownship: string;
}

const SESSION_MODE_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In-person" },
  { value: "both", label: "Both" },
] as const;

export function TutorApplyForm({ defaultName, defaultUniversity, defaultTownship }: TutorApplyFormProps) {
  const router = useRouter();
  const [csvText, setCsvText] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);

  const [name, setName] = useState(defaultName);
  const [photoUrl, setPhotoUrl] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [university, setUniversity] = useState(defaultUniversity);
  const [township, setTownship] = useState(defaultTownship);
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");
  const [sessionMode, setSessionMode] = useState<"online" | "in_person" | "both">("both");
  const [availabilityNote, setAvailabilityNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const step2Unlocked = !!eligibility?.ok && eligibility.eligible;
  const canSubmit =
    step2Unlocked && !!name && subjects.length > 0 && !!university && !!township && !!price && !submitting;

  async function handleSubmit() {
    if (!csvText) return;
    setSubmitting(true);
    try {
      const result = await applyAsTutor({
        csvText,
        name,
        photoUrl,
        subjects,
        university,
        township,
        bio,
        pricePerSession: price,
        sessionMode,
        availabilityNote,
      });
      if (result.ok) {
        router.push(`/services/tutor/${result.tutorId}`);
      } else {
        toast.error(result.error === "already-a-tutor" ? "You already have a tutor profile." : result.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-5 md:px-8">
      <GradesCsvUpload
        onResult={(text, res) => {
          setCsvText(text);
          setEligibility(res);
        }}
      />

      {step2Unlocked && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Tutor profile</h2>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tutor-name">Full name</Label>
            <Input id="tutor-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tutor-photo">Photo URL (optional)</Label>
            <Input
              id="tutor-photo"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </div>

          <SubjectMultiSelect value={subjects} onChange={setSubjects} />

          <LabeledSelect
            id="tutor-university"
            label="University"
            placeholder="Select university"
            value={university}
            onChange={setUniversity}
            options={UNIVERSITIES}
          />

          <LabeledSelect
            id="tutor-township"
            label="Township"
            placeholder="Select township"
            value={township}
            onChange={setTownship}
            options={TOWNSHIPS}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="tutor-bio">Short bio</Label>
            <Textarea
              id="tutor-bio"
              placeholder="Tell students a bit about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tutor-price">Price per session (MMK)</Label>
            <Input
              id="tutor-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tutor-session-mode">Session mode</Label>
            <Select value={sessionMode} onValueChange={(v) => setSessionMode(v as typeof sessionMode)}>
              <SelectTrigger id="tutor-session-mode" className="w-full">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tutor-availability">Availability note</Label>
            <Input
              id="tutor-availability"
              placeholder="e.g. Weekday evenings"
              value={availabilityNote}
              onChange={(e) => setAvailabilityNote(e.target.value)}
            />
          </div>

          <Button
            type="button"
            size="touch"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
          >
            {submitting ? "Submitting..." : "Submit application"}
          </Button>
        </div>
      )}
    </div>
  );
}
