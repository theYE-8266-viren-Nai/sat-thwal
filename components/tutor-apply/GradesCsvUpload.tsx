"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseGradesCsv, type EligibilityResult } from "@/lib/tutorEligibility";

interface GradesCsvUploadProps {
  onResult: (csvText: string, result: EligibilityResult) => void;
}

export function GradesCsvUpload({ onResult }: GradesCsvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseGradesCsv(text);
    setResult(parsed);
    onResult(text, parsed);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleChange} />
      <Button
        type="button"
        variant="outline"
        size="touch"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-xl"
      >
        <Upload className="h-4 w-4" />
        {fileName ? `Change file (${fileName})` : "Upload grades CSV"}
      </Button>

      {result && !result.ok && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{result.error}</p>
      )}

      {result?.ok && (
        <div className="flex flex-col gap-2">
          {result.semesters.map((s) => (
            <div key={s.semester} className="flex items-center gap-2 text-sm text-foreground">
              {s.eligible ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-mint" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
              <span>
                Semester {s.semester}: {s.aCount} A&apos;s
              </span>
            </div>
          ))}
          {!result.eligible && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Not eligible yet. {result.reason}
            </p>
          )}
          {result.eligible && (
            <p className="rounded-xl bg-brand-mint/10 px-4 py-3 text-sm text-brand-mint">
              You&apos;re eligible! Complete your tutor profile below.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
